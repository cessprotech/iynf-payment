import { Connection, Model, PaginateModel, PaginateOptions } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateTransactionDto, UpdateTransactionDto } from './app.dto';
import { Transaction } from './app.schema';
import { DeepRequired } from 'ts-essentials';
import { TRANSACTION_RESPONSE } from './app.response';
import { LogService, Logger } from '@core/logger';
import { Paystack_Client } from './common/paystack';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG } from './app.constants';
import { MSResponse } from '@core/common/interfaces';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Flutterwave_Client } from './common/flutterwave';
import { nanoid } from 'nanoid';
import { Stripe_Client } from './common/stripe';
import stripe from 'stripe';
// import { CachingService } from '@libs/modules/caching';
@Injectable()
export class AppService {
  @Logger(AppService.name) private logger = new LogService();
  private config_service = new ConfigService();

  constructor(
    @InjectConnection() private readonly connection: Connection,

    @Inject(APP_CONFIG.INFLUENCER_SERVICE) private readonly influencerClient: ClientProxy,

    @InjectModel(Transaction.name) public readonly transactionModel: Model<Transaction> & PaginateModel<Transaction>,
    // private cache: CachingService,
    private eventEmitter: EventEmitter2,
  ) { }

  async testServer() {
    return 'Hello World!';
  }

  async create(createTransactionDto: CreateTransactionDto) {
    console.log('inside create function');
    

    const base_amount = createTransactionDto.amount * 100;

    const transactionExists = await this.transactionModel.findOne({ bidId: createTransactionDto.bidId, jobId: createTransactionDto.jobId, influencerId: createTransactionDto.influencerId });

    if (!!transactionExists) return transactionExists;

    try {
      const { data } = await this.paymentCreate(0, createTransactionDto);

      const transaction = await this.transactionModel.create({ ...createTransactionDto, base_amount, reference: data.id });

      this.eventEmitter.emit(TRANSACTION_RESPONSE.LOG.CREATE, transaction);

      // return transaction;
      return { status: true, data: transaction, error: null };

    } catch (error) {
      this.logger.error(error.message, error);
      // throw error;
      return { status: false, data: null, error: 'Error occured while processing payment.' };
    }

  }

  async verify(reference: string) {

    try {
      
      const { status, data, transaction } = await this.verifyCancelledPayment(reference)

      if (!status) {
        return transaction;
      };

      const updatedTransaction = await this.transactionModel.findByIdAndUpdate(transaction._id, {
        success: status,
        status: data.status,
      }, { new: true })


      this.eventEmitter.emit(TRANSACTION_RESPONSE.LOG.VERIFIED, transaction);

      const hired: MSResponse = await firstValueFrom(
        this.influencerClient.send({ cmd: 'HIRE_INFLUENCER' }, {
          transactionId: transaction.transactionId,
          bidId: transaction.bidId
        }),
      );

      if (!hired.status) throw new BadRequestException(hired.error);

      return updatedTransaction;

    } catch (error) {
      this.logger.error(error.message, error);
      throw new BadRequestException(error.message);
    }

  }

  async verifyCancelledPayment(reference: string) {

    const transaction = await this.getOneByRef(reference);

    if ((transaction.success && transaction.allocated) || transaction.status !== 'processing') return { status: false, transaction, data: null };

    try {
      const { data } = await this.paymentVerify(0, reference);

      const { status, transaction: cancelled } = await this.updateTransactionIfStatusFalse(transaction._id, data);

      const returnObj = { status, data, transaction }

      if (!status) {
        returnObj.transaction = cancelled!;
      };

      return returnObj;

    } catch (error) {
      this.logger.error(error.message, error);
      throw new BadRequestException(error.message);
    }

  }

  async paymentCreate(type: 0 | 1, data: CreateTransactionDto) {

    if (type === 0) {
      try {
        const { data: response } = await Stripe_Client.post('/v1/payment_intents',
          {
            amount: data.amount,
            currency: "usd",
            automatic_payment_methods: {
              enabled: true,
            },
            metadata: {
              creatorId: data.creatorId,
              influencerId: data.influencerId,
              jobId: data.jobId,
              bidId: data.bidId,
            },
          }
        );
        return { data: response };

      } catch (error) {
        console.log(error.response.data);
        throw new InternalServerErrorException();
      }


    }
    else if (type === 1) { }

    return {}
  }

  async paymentVerify(type: 0 | 1, id: string) {
    if (type === 0) {
      
      try {
        const { data } = await Stripe_Client.get(`/v1/payment_intents/${id}`);

        return { data };

      } catch (error) {
        return { data: error.response.data };
      }
    }

    return {}
  }

  async webhookVerify(signature: string, payload: any) {
    const secretHash = this.config_service.get(APP_CONFIG.FLW_WEBHOOK_HASH);

    let event: Record<string, any>;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, secretHash);
    } catch (err) {
      // invalid signature
      throw new BadRequestException('Bad Signature');
    }

    let intent: Record<string, any>;
    switch (event['type']) {
      case 'payment_intent.succeeded':
        intent = event.data.object;
        this.verify(intent.id);

        console.log("Succeeded:", intent.id);
        break;
      case 'payment_intent.payment_failed':
        intent = event.data.object;
        const message = intent.last_payment_error && intent.last_payment_error.message;
        this.verify(intent.id);

        console.log('Failed:', intent.id, message);
        break;
    }
  }

  async getAll(query: Record<string, any>, paginateOptions: PaginateOptions = {}) {

    const { page, limit, select, sort, ...rest } = query;

    return await this.transactionModel.paginate({ ...rest }, paginateOptions);
  }

  // async getAllUserTransactions(query?: Record<string, any>, paginateOptions: PaginateOptions = {}) {

  //   const {page, limit, select, sort, ...rest} = query;

  //   return await this.transactionModel.paginate({...rest }, paginateOptions);
  // }

  async getOne(id: string) {
    const transaction = await this.transactionModel.findOne({
      $or: [
        { _id: id || '' },
        { transactionId: id || '' }
      ]
    });

    if (!transaction) {
      throw new NotFoundException('Transaction Not Found');
    }

    return transaction;
  }

  async getOneByRef(reference: string) {
    const transaction = await this.transactionModel.findOne({ reference });

    if (!transaction) {
      throw new NotFoundException('Transaction Not Found');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.getOne(id);

    return await this.transactionModel.findOneAndUpdate({ _id: transaction._id }, { ...updateTransactionDto }, {
      new: true,
      runValidators: true
    })

  }

  private async updateTransactionIfStatusFalse(id: string, data: { status: string, [key: string]: any }) {
    
    const success = data.status.includes('succeed') ? true : false

    const canceled = data.status.includes('canceled') ? true : false;


    if (!success && canceled) {
      const transaction = await this.transactionModel.findByIdAndUpdate(id, {
        status: 'canceled',
      }, { new: true });

      return { status: success, transaction };
    };

    return { status: success };
  }

  remove(id: string) {

    return `This action removes a #${id} transaction`;
  }
}

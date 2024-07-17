import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Req, UseFilters, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from '@core/common/interceptors/response';
import { HttpValidationFilter, MongooseExceptionFilter } from '@core/common/filters';
import { ApiTags } from '@nestjs/swagger';
import { TAGS } from '@app/common/constants';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { LogService, Logger } from '@core/logger';
import { TRANSACTION_RESPONSE } from './app.response';
import { CreateTransactionDto, UpdateTransactionDto } from './app.dto';
import { QueryOptions } from './common/helpers';
import { Protect, Public } from '@core/auth/decorators';

@ApiTags(TAGS.DEFAULT)
@UseFilters(HttpValidationFilter)
@UseFilters(MongooseExceptionFilter)
@Controller(TAGS.DEFAULT.toLowerCase())
// @UsePipes(ZodValidationPipe)
export class AppController {

  @Logger(AppController.name) private logger = new LogService();

  constructor(private readonly appService: AppService) {
  }

  @MessagePattern({ cmd: 'PAY_BID' })
  async create(data: CreateTransactionDto) {
    return await this.appService.create(data);
  }

  @Public()
  @Get('me')
  @Response(TRANSACTION_RESPONSE.CREATE)
  async testServer() {
    return await this.appService.testServer();
  }

  @Public()
  @Post('create')
  @Response(TRANSACTION_RESPONSE.CREATE)
  async createTra(@Body() data: CreateTransactionDto) {
    return await this.appService.create(data);
  }

  @Public()
  @Get('tx_ref/:reference/single')
  @Response(TRANSACTION_RESPONSE.FIND_ONE_BY_ID)
  async getTransactionByRef(@Param('reference') reference: string) {
    if (!reference) throw new BadRequestException('Transaction reference is needed.');

    return (await this.appService.verifyCancelledPayment(reference)).transaction;
  }

  @Public()
  @Get('verify')
  @Response(TRANSACTION_RESPONSE.LOG.VERIFIED)
  verifyTransaction(@Query('reference') reference: string) {
    if (!reference) throw new BadRequestException('Transaction reference is needed.');

    return this.appService.verify(reference);
  }

  @Public()
  @Get('p-verify')
  @Response(TRANSACTION_RESPONSE.LOG.VERIFIED)
  payTransaction(@Query('reference') reference: string) {
    if (!reference) throw new BadRequestException('Transaction reference is needed.');

    return this.appService.paymentVerify(0, reference);
  }

  @Public()
  @Post('verify-webhook')
  @Response("webhook verified")
  webhook(@Req() req) {

    return this.appService.webhookVerify(req.headers["stripe-signature"], req.body);
  }

  @Public()
  @Get()
  @Response(TRANSACTION_RESPONSE.DEFAULT)
  async getAll(@Query() query) {
    const { otherQuery, paginateOptions } = QueryOptions(query, true);

    paginateOptions.populate = [
      { path: 'job' },
      // { path: 'influencer' },
      // { path: 'creator' },
      {
        path: 'creator',
        select: ['creatorId', 'userId'],
        populate: { path: 'user', select: ['firstName', 'lastName'] },
      },
      {
        path: 'influencer',
        select: ['influencerId', 'userId'],
        populate: { path: 'user', select: ['firstName', 'lastName'] },
      },
      
      { path: 'bid' },
    ];

    return await this.appService.getAll(otherQuery, paginateOptions);
  }

  @Public()
  @Get(':_id/single')
  @Response(TRANSACTION_RESPONSE.UPDATE)
  getTransaction(@Param('_id') id: string) {
    return this.appService.getOne(id);
  }

  @MessagePattern({ cmd: 'GET_BY_USERS' })
  async accumulate(data: { user: string }) {
    this.logger.log("Event Microservice");

    if (data?.user.toLowerCase() === 'error') {
      return {
        status: 400,
        message: 'ahhh! error.'
      };
    }


    return {
      status: 200,
      data: {
        name: 'Captain Collegea'
      }
    }
  }
}

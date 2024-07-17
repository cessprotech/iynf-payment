import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types, model as Model } from 'mongoose';
import { NextFunction } from 'express';

import { CREATE_SCHEMA, customPropsDefault } from '@core/utils/models';
import { nanoid } from 'nanoid';
import { IsEmail } from 'class-validator';


/**
 * @class
 * @description typical mongoose schema definition stating the accurate data structure of each field in the document
 * @exports mongooseSchema
 * @extends Mongoose_DOCUMENT_INTERFACE
 */

@Schema(customPropsDefault([]))
export class Transaction extends Document {

  @Prop({ default: () => nanoid(12), unique: true })
  readonly transactionId: string;

  @Prop({ required: [true, 'User Is Required!'], unique: true })
  readonly userId: string;

  @Prop({ required: [true, 'Creator Id Is Required!'] })
  readonly creatorId: string;

  @Prop({ required: [true, 'Influencer Id Is Required!'] })
  readonly influencerId: string;

  @Prop({ required: [true, 'Job Id Is Required!'] })
  readonly jobId: string;

  @Prop({ required: [true, 'Bid Id Is Required!'] })
  readonly bidId: string;

  @Prop({ required: [true, 'Reference Is Required!'] })
  readonly reference: string;

  @Prop({ required: [true, 'Status Is Required!'], default: 'processing' })
  readonly status: string;

  @Prop({ required: [true, 'Amount Is Required!'] })
  readonly amount: number;

  @Prop({ required: [true, 'Base Amount Is Required!'] })
  readonly base_amount: number;

  @Prop({})
  readonly fees: number;

  @Prop({})
  readonly channel: string;

  @Prop({})
  readonly history: Record<string, any>[]

  @Prop({})
  readonly ip_address: string

  @Prop({})
  readonly paid_at: string

  @Prop({})
  readonly paid_at_utc: Date

  @Prop({
    default: false
  })
  readonly success: boolean;

  @Prop({
    default: false
  })
  readonly allocated: boolean;

  @Prop({})
  readonly allocated_at: string;


}

const TransactionModelName = Transaction.name;
const TransactionSchema = CREATE_SCHEMA<Transaction>(Transaction);

TransactionSchema.index({ userId: 1 });

TransactionSchema.virtual('user', {
  ref: "User",
  localField: 'userId',
  foreignField: 'userId',
  justOne: true
});

TransactionSchema.virtual('creator', {
  ref: "Creator",
  localField: 'creatorId',
  foreignField: 'creatorId',
  justOne: true
});

TransactionSchema.virtual('influencer', {
  ref: "Influencer",
  localField: 'influencerId',
  foreignField: 'influencerId',
  justOne: true
});

TransactionSchema.virtual('job', {
  ref: "Job",
  localField: 'jobId',
  foreignField: 'jobId',
  justOne: true
});

TransactionSchema.virtual('bid', {
  ref: "Bid",
  localField: 'bidId',
  foreignField: 'bidId',
  justOne: true
});


TransactionSchema.pre('save', async function (next: NextFunction) {
  if (this.isNew) { }

  next();
});

TransactionSchema.pre(/update|updateOne|findOneAndUpdate|findByIdAndUpdate/, async function () {

  const transaction: any = this

  const query = transaction._conditions;

  const updateFields = transaction._update;

});


const TransactionModel = { name: TransactionModelName, schema: TransactionSchema };

export { TransactionSchema, TransactionModelName, TransactionModel };


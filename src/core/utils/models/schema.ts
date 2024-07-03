import { Document, Model, PaginateModel, Schema, model } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
import { ISchema } from './interface';

export interface IModel<T> {
  name: string;

  schema: Schema<T & Document>;
}
/**
 * @description removing unwanted props from a mongodb returned document
 *
 */
const removeProps =
  (props?: string | string[]) => (_: Document, ret: Document) => {
    if (Array.isArray(props)) {
      props.forEach((prop) => delete ret[prop]);
    }

    delete ret.id;

    delete ret.__v;

    return ret;
  };

/**
 * @description formats schema options
 *
 * @return {object} Schema Options
 */
export const customProps = (props?: string | string[]) => ({
  virtuals: true,
  versionKey: false,
  transform: removeProps(props),
});

/**
 * @description formats schema options
 *
 * @return {object} Connection Options
 */

export const customPropsDefault = (props?: string | string[]) => ({
  timestamps: true,

  toJSON: customProps(props),

  toObject: customProps(props),
});

/**
 * @description creates a new mongoose schema from received class
 *
 * @props schemaClass - Class to create schema from
 *
 * @return {object} MongooseSchema
 */

export const CREATE_SCHEMA = <T>(schemaClass: ISchema<T>) =>
  SchemaFactory.createForClass<T>(schemaClass);

export const CREATE_MODEL = <T extends Document>(options: IModel<T>) => model<T>(options.name, options.schema) as Model<T> & PaginateModel<T> & typeof options.schema.statics;
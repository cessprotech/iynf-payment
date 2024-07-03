import { Injectable } from '@nestjs/common';
import { InjectConfigValidation } from '@core/config';
import * as Joi from 'joi';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppEnvClass {
  APP_NAME = Joi.string().required();

  APP_VERSION = Joi.string().required();

  APP_DESCRIPTION = Joi.string().required();

  DOCS_ROUTE = Joi.string().required();

  SENTRY_DSN = Joi.string();

  HOST = Joi.string().default('http://localhost');

  PORT = Joi.number().default(5045);

  REDIS_CLOUD = Joi.string().required();

  RMQ_URI = Joi.string().required();

  RMQ_PAYMENT_QUEUE = Joi.string().required();

  RMQ_INFLUENCER_QUEUE = Joi.string().required();
  INFLUENCER_SERVICE = Joi.string().default('INFLUENCER_SERVICE');


  AUTH_TYPE = Joi.string().equal('jwt', 'ssa').required();

  NODE_ENV = Joi.string().equal('production', 'development').required();

  MONGO_STORE_SECRET = Joi.string().required();

  MONGO_STORE_TTL = Joi.number().required();

  EXPRESS_SESSION_SECRET = Joi.string().required();

  EXPRESS_SESSION_NAME = Joi.string().required();

  EXPRESS_COOKIE_MAX_AGE = Joi.number().required();

  JWT_SECRET = Joi.string();

  JWT_EXPIRES = Joi.number();

  // AWS_REGION = Joi.string().required();
  // AWS_ACCESS_KEY_ID = Joi.string().required();
  // AWS_ACCESS_KEY_SECRET = Joi.string().required();
  // AWS_BUCKET_NAME = Joi.string().required();

  USER_SERVICE = Joi.string().default('USER_SERVICE');
  RMQ_USER_QUEUE = Joi.string().required();

  PAYSTACK_API = Joi.string().required();
  PAYMENT_CANCEL_URL = Joi.string();
  PAYMENT_REDIRECT_URL = Joi.string();

  FLUTTERWAVE_API = Joi.string();
  STRIPE_API = Joi.string();
  FLW_WEBHOOK_HASH = Joi.string();
  FLUTTERWAVE_CANCEL_URL = Joi.string();
}


export const APP_ENV_FN = InjectConfigValidation<AppEnvClass>('app', new AppEnvClass());

@Injectable()
export class APP_ENV {
  static service = new ConfigService();


  static get(key: string): any {
    return APP_ENV.service.get(key)
  }
}
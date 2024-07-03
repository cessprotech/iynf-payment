import { Module } from '@nestjs/common';
// import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from '@core/logger';
import { MessageModule } from '@core/modules/message';
// import { MiddlewareModule } from '@libs/modules/middleware';
import { EventEmitModule } from '@core/modules/event-emitter';

import { CONFIG_VALIDATORS } from '@core/config';
import { APP_ENV, APP_ENV_FN } from './app.config';
import { DB_CONNECTION, MODEL_INJECT } from '@core/modules/database';
import { ShutdownService } from './power.service';
// import { CachingModule } from '@libs/modules/caching/caching.module';
import { MicroServicesConfig } from './config.service';
import { ExternalModels } from './schema/externals.schema';
import { TransactionModel } from './app.schema';
import { SentryInterceptor } from '@core/common/interceptors/sentry.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    DB_CONNECTION,

    MODEL_INJECT([ TransactionModel ,...ExternalModels ]),

    LogModule.forRoot(),

    ConfigModule.forRoot({
      load: [APP_ENV_FN],
      validationSchema: CONFIG_VALIDATORS,
      cache: true,
      isGlobal: true,
    }),

    MicroServicesConfig(),

    // MiddlewareModule,

    MessageModule,    
    //features
    EventEmitModule,

  ],

  controllers: [AppController],

  providers: [AppService, ShutdownService, 
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ],
})
export class AppModule {}

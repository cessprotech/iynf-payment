import { APP_ENV_FN } from '@app/app.config';
import { ConfigType } from '@nestjs/config';
import { Transport, ClientsModule } from '@nestjs/microservices';
import { APP_CONFIG } from '@app/app.constants';


export function MicroServicesConfig() {
    const appConfig: ConfigType<typeof APP_ENV_FN> = APP_ENV_FN()

    return ClientsModule.register([
        {
            name: APP_CONFIG.USER_SERVICE,
            transport: Transport.RMQ,
            options: {
                urls: [`${appConfig.RMQ_URI}`],
                queue: `${appConfig.RMQ_USER_QUEUE}`,
                queueOptions: { durable: false },
                persistent: true
            },
        },

        {
            name: APP_CONFIG.INFLUENCER_SERVICE,
            transport: Transport.RMQ,
            options: {
                urls: [`${appConfig.RMQ_URI}`],
                queue: `${appConfig.RMQ_INFLUENCER_QUEUE}`,
                queueOptions: { durable: false },
                persistent: true
            },
        },
    ]);
}

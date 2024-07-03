import axios from 'axios';
import axiosRetry from 'axios-retry';
import { APP_CONFIG } from '@app/app.constants';
import { APP_ENV } from '@app/app.config';

const Stripe_Client = axios.create({
    baseURL: 'https://api.stripe.com', headers: {
        Authorization: `Bearer ${APP_ENV.get(APP_CONFIG.STRIPE_API)}`,
        "Content-Type": 'application/x-www-form-urlencoded)'
    }
});

axiosRetry(Stripe_Client, { retries: 3 });

export { Stripe_Client };
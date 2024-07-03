import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG_SERVICE } from './helpers';
import { APP_CONFIG } from '@app/app.constants';
import { APP_ENV } from '@app/app.config';

const Paystack_Client = axios.create({ baseURL: 'https://api.paystack.co', headers: {
    Authorization: `Bearer ${APP_ENV.get(APP_CONFIG.PAYSTACK_API)}`,
    "Content-Type": 'application/json'
} });

axiosRetry(Paystack_Client, { retries: 3 });

export { Paystack_Client };
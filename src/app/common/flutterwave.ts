import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG_SERVICE } from './helpers';
import { APP_CONFIG } from '@app/app.constants';
import { APP_ENV } from '@app/app.config';

const Flutterwave_Client = axios.create({ baseURL: 'https://api.flutterwave.com/v3', headers: {
    Authorization: `Bearer ${APP_ENV.get(APP_CONFIG.FLUTTERWAVE_API)}`,
    "Content-Type": 'application/json'
} });

axiosRetry(Flutterwave_Client, { retries: 3 });

export { Flutterwave_Client };
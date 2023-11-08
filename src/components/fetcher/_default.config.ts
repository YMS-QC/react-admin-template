import { FetcherConfig } from './types';

export const defaultFetcherConfig = (): FetcherConfig => {
    return {
        // baseURL: 'http://192.168.1.12:3333/api/',
        timeout: 10000,
        interceptors: {},
        token: null,
        cancel_repeat: true,
        swr: {},
    };
};

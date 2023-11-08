import { useCallback, useContext } from 'react';

// import { AuthStore, useAuthDispatch, useAuthInited, useToken } from '../Auth';

import { FetcherContext } from './constants';
import { FetcherConfig } from './types';
import { createRequest } from './utils';

/**
 * 获取一个响应式的fetcher实例
 * @param config 当前fetcher配置
 */
export const useFetcher = () => useContext(FetcherContext);
/**
 * 获取一个静态的fetcher生成函数
 * 每次执行函数时内部的状态变量都会是最新值
 */
export function useFetcherCreater() {
    console.log('hello?');
    return useCallback((config?: FetcherConfig) => createRequest(config), []);
}

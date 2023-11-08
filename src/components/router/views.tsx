/* eslint-disable react-refresh/only-export-components */
import { has, isNil, omit } from 'lodash';
import pMinDelay from 'p-min-delay';
import { timeout } from 'promise-timeout';
import { FC, lazy, Suspense } from 'react';
import { useLocation, DataRouteObject, Navigate } from 'react-router';

import { RouteOption, RouterConfig } from './types';

/**
 * 根据正则和glob递归获取所有动态页面导入映射
 * [key:bar/foo]: () => import('{起始目录: 如pages}/bar/foo.blade.tsx')
 * @param imports 需要遍历的路径规则,支持glob
 * @param reg 用于匹配出key的正则表达式
 */
const getAsyncImports = (imports: Record<string, () => Promise<any>>, reg: RegExp) => {
    return Object.keys(imports)
        .map((key) => {
            const names = reg.exec(key);
            return Array.isArray(names) && names.length >= 2
                ? { [names[1]]: imports[key] }
                : undefined;
        })
        .filter((m) => !!m)
        .reduce((o, n) => ({ ...o, ...n }), []) as unknown as Record<string, () => Promise<any>>;
};
/**
 * 所有动态页面映射
 */
export const pages = getAsyncImports(
    import.meta.glob('../../views/**/*.page.{tsx,jsx}'),
    /..\/\..\/views\/([\w+.?/?]+)(.page.tsx)|(.page.jsx)/i,
);

/**
 * 异步页面组件
 * @param props
 */
export const getAsyncImport = (props: { page: string }) => {
    const { page } = props;
    if (!has(pages, page)) throw new Error(`Page ${page} not exits in 'views' dir!`);
    return lazy(() => timeout(pMinDelay(pages[page](), 5), 3000));
};

/**
 * 未登录跳转页面组件
 * @param props
 */
export const AuthRedirect: FC<{
    /** 登录跳转地址 */
    loginPath?: string;
}> = ({ loginPath }) => {
    const location = useLocation();
    let redirect = `?redirect=${location.pathname}`;
    if (location.search) redirect = `${redirect}${location.search}`;
    return <Navigate to={`${loginPath}${redirect}`} replace />;
};

/**
 * 构建路由渲染列表
 * @param routes
 */
export const factoryRoutes = (routes: RouteOption[], loading: RouterConfig['loading']) =>
    routes.map((item) => {
        let option: DataRouteObject = generateAsyncPage(loading, item);
        const { children } = option;
        option = generateAsyncPage(loading, option);
        if (!isNil(children) && children.length) {
            option.children = factoryRoutes(children, loading);
        }
        return option;
    });

/**
 * 获取异步路由页面
 * @param config
 * @param option
 */
const generateAsyncPage = (Loading: RouterConfig['loading'], option: RouteOption) => {
    const item = { ...omit(option, ['Component', 'ErrorBoundary']) } as DataRouteObject;
    let fallback: JSX.Element | undefined;
    if (Loading) fallback = <Loading />;
    if (option.loading) fallback = <option.loading />;
    if (typeof option.page === 'string') {
        const AsyncPage = getAsyncImport({
            page: option.page as string,
        });
        if (!isNil(option.pageRender)) {
            item.Component = () => option.pageRender!(item, AsyncPage);
        } else {
            item.Component = ({ ...rest }) => (
                <Suspense fallback={fallback}>
                    <AsyncPage route={item} {...rest} />
                </Suspense>
            );
        }
    } else {
        item.Component = option.page;
    }
    if (typeof option.error === 'string') {
        const AsyncErrorPage = getAsyncImport({
            page: option.error as string,
        });
        if (!isNil(option.errorRender)) {
            item.ErrorBoundary = () => option.errorRender!(item, AsyncErrorPage);
        } else {
            item.ErrorBoundary = ({ ...rest }) => (
                <Suspense fallback={fallback}>
                    <AsyncErrorPage route={item} {...rest} />
                </Suspense>
            );
        }
    } else {
        item.ErrorBoundary = option.error;
    }
    return item as DataRouteObject;
};

import { isNil, omit, trim } from 'lodash';

import { redirect } from 'react-router';

import { isUrl } from '@/utils';

import { IAuth } from '../auth/type';

import { RouteOption } from './types';

export const redirectPath = (url: string, base?: string, init?: number | ResponseInit) =>
    redirect(getRedirectPath(url, isNil(base) ? import.meta.env.APP_PREFIX : base), init);

export const getRedirectPath = (basename: string, to?: string) => {
    const basePath = isNil(basename) ? '/' : `/${trim(basename, '/')}`;
    const toPath = isNil(to) ? '' : trim(to, '/');
    return basePath === '/' ? `${basePath}${toPath}` : `${basePath}/${toPath}`;
};

export const getAuthRoutes = (routes: RouteOption[], auth: IAuth | null): RouteOption[] =>
    routes
        .map((route) => {
            if (route.auth !== false && route.auth?.enabled !== false) {
                if (isNil(auth)) return [];
                if (typeof route.auth !== 'boolean' && route.auth?.permissions?.length) {
                    if (!route.auth.permissions.every((p) => auth.permissions.includes(p))) {
                        return [];
                    }
                    if (!route.children?.length) return [route];
                    return [{ ...route, children: getAuthRoutes(route.children, auth) }];
                }
            }
            return [route];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获取路由表
 * @param routes
 */
export const getRoutes = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((route) => {
            if (route.devide) return [];
            if ((!route.index && isNil(route.path)) || isUrl(route.path)) {
                return route.children?.length ? getRoutes(route.children) : [];
            }
            return [route];
        })
        .reduce((o, n) => [...o, ...n], []);

export const getMenus = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((item) => {
            if (!isNil(item.menu) && !item.menu) {
                return item.children?.length ? getMenus(item.children) : [];
            }
            return [
                { ...item, children: item.children?.length ? getMenus(item.children) : undefined },
            ];
        })
        .reduce((o, n) => [...o, ...n], []);
/**
 * 获取扁平化路由
 * @param routes
 */
export const getFlatRoutes = (routes: RouteOption[]): RouteOption[] =>
    routes
        .map((item) => {
            if (item.devide) return [];
            return item.children?.length ? [item, ...getFlatRoutes(item.children)] : [item];
        })
        .reduce((o, n) => [...o, ...n], []);

/**
 * 获取带全路径的路由
 * @param routes
 * @param parentPath
 */
export const getFullPathRoutes = (routes: RouteOption[], parentPath?: string): RouteOption[] =>
    routes
        .map((route) => {
            if (route.devide) return [];
            const item: RouteOption = { ...route };
            const pathPrefix: { parent?: string; child?: string } = {
                parent: trim(parentPath ?? '', '/').length
                    ? `/${trim(parentPath ?? '', '/')}/`
                    : '/',
                child: trim(parentPath ?? '', '/').length ? `/${trim(parentPath ?? '', '/')}` : '/',
            };
            if (route.devide || route.index) return [omit(route, ['children', 'path'])];
            if (isUrl(route.path)) {
                item.path = route.path;
            } else {
                pathPrefix.child = route.path?.length
                    ? `${pathPrefix.parent}${trim(route.path, '/')}`
                    : pathPrefix.child;
                item.path = route.onlyGroup ? undefined : pathPrefix.child;
            }
            item.children = route.children?.length
                ? getFullPathRoutes(route.children, pathPrefix.child)
                : undefined;
            if (route.onlyGroup) item.children = item.children?.length ? item.children : [];
            return [item];
        })
        .reduce((o, n) => [...o, ...n], []);

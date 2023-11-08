import { isNil, trim } from 'lodash';
import { useCallback, useEffect } from 'react';

import { NavigateOptions, To, useNavigate } from 'react-router';

import { shallow } from 'zustand/shallow';

import { config } from '@/config';
import { deepMerge } from '@/utils';

import { useAuth } from '../auth/hooks';
import { createStoreHooks } from '../store';

import { getDefaultRouterConfig } from './_default.config';
import { RouterStore } from './store';
import { NavigateTo, RouteNavigator, RouteOption } from './types';
import { getAuthRoutes, getFlatRoutes, getFullPathRoutes, getMenus, getRoutes } from './utils';
import { AuthRedirect } from './views';

export const useRouterSetuped = () => {
    const ready = RouterStore((state) => state.ready);
    const auth = useAuth();
    RouterStore.subscribe(
        (state) => state.config.basename,
        () => {
            RouterStore.setState((draft) => {
                const { basename } = draft.config;
                if (isNil(basename)) draft.config.basename = '/';
                else if (basename.length > 1 && basename.charAt(basename.length - 1) === '/') {
                    draft.config.basename = `/${trim(basename, '/')}`;
                }
            });
        },
        { equalityFn: shallow, fireImmediately: true },
    );
    useEffect(() => {
        if (RouterStore.getState().config.auth?.enabled) {
            const { config: routerConfig } = RouterStore.getState();
            const { routes: defaultRoutes } = deepMerge(
                getDefaultRouterConfig(),
                config().router ?? {},
                'replace',
            );
            let routes = [...defaultRoutes];
            const routeIDS = routes.map(({ id }) => id);
            if (!routeIDS.find((id) => id === 'auth.login')) {
                routes.push({
                    id: 'auth.login',
                    auth: false,
                    menu: false,
                    path: routerConfig.auth?.path,
                    page: routerConfig.auth?.page,
                });
            }
            if (isNil(auth)) {
                if (!routeIDS.find((id) => id === 'auth.redirect')) {
                    routes.push({
                        id: 'auth.redirect',
                        path: '*',
                        auth: false,
                        element: <AuthRedirect loginPath={routerConfig.auth?.path} />,
                    });
                }
            } else {
                routes = routes.filter((route) => route.id !== 'auth.redirect');
            }
            RouterStore.setState((state) => {
                state.config.routes = getAuthRoutes(routes, auth);
                state.ready = false;
            });
        }
    }, [auth]);

    useEffect(() => {
        if (!ready) {
            // console.log(RouterStore.getState().config.routes);
            RouterStore.setState((state) => {
                const { routes } = state.config;
                state.menus = getMenus(getFullPathRoutes(routes));
                state.routes = getRoutes(routes);
                state.flat = getFlatRoutes(getFullPathRoutes(routes));
                state.ready = true;
            });
        }
    }, [ready]);
};

/**
 * 获取路由状态池的钩子
 */
export const useRouterStore = createStoreHooks(RouterStore);

/**
 * 路由列表操作
 */
export const useRoutesChange = () => {
    const addRoutes = useCallback(
        /** 添加路由 */
        <T extends RecordAnyOrNever>(items: RouteOption<T>[]) => {
            RouterStore.setState((state) => {
                state.config.routes = [...state.config.routes, ...items];
                state.ready = false;
            });
        },
        [],
    );
    const setRoutes = useCallback(
        /** 重置路由 */
        <T extends RecordAnyOrNever>(items: RouteOption<T>[]) => {
            RouterStore.setState((state) => {
                state.config.routes = [...items];
                state.ready = false;
            });
        },
        [],
    );
    return {
        addRoutes,
        setRoutes,
    };
};

export const useNavigatePath = () => {
    const flats = RouterStore(useCallback((state) => state.flat, []));
    const navigate = useNavigate();
    return useCallback(
        (to: NavigateTo) => {
            let goTo: To | undefined;
            if (typeof to === 'string') goTo = to;
            else if (to.pathname) {
                goTo = { ...to };
            } else {
                const route = flats.find((item) => to.id && item.id === to.id);
                if (route && route.path) goTo = { ...to, pathname: route.path };
            }
            if (isNil(goTo)) return undefined;
            return goTo;
        },
        [flats, navigate],
    );
};
export const useNavigator = (): RouteNavigator => {
    const navigate = useNavigate();
    const getPath = useNavigatePath();
    return useCallback((to: NavigateTo, options?: NavigateOptions) => {
        const path = getPath(to);
        if (!isNil(path)) navigate(path, options);
    }, []);
};

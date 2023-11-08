import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router-dom';

import { shallow } from 'zustand/shallow';

import Auth from '../auth/provider';

import { useRouterSetuped, useRouterStore } from './hooks';
import { factoryRoutes } from './views';

/**
 * 路由渲染组件,用于渲染最终路由
 */
const RouterWrapper: FC = () => {
    const { ready, basename, hash, window, routes, loading } = useRouterStore(
        (state) => ({ ready: state.ready, ...state.config }),
        shallow,
    );
    if (!ready || routes.length <= 0) return null;
    const router = hash
        ? createHashRouter(factoryRoutes(routes, loading), { basename, window })
        : createBrowserRouter(factoryRoutes(routes, loading), { basename, window });
    return <RouterProvider router={router} />;
};

const RouterComponent: FC = () => {
    useRouterSetuped();
    return <RouterWrapper />;
};

const Router: FC = () => {
    const isAuth = useRouterStore((state) => state.config.auth?.enabled);
    return isAuth ? (
        <Auth>
            <RouterComponent />
        </Auth>
    ) : (
        <RouterComponent />
    );
};
export default Router;

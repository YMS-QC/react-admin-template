import { RouteOption } from '@/components/router/types';
import { redirectPath } from '@/components/router/utils';

export const errors: RouteOption = {
    id: 'errors',
    menu: false,
    path: '/errors',
    children: [
        {
            id: 'errors.default',
            menu: false,
            index: true,
            loader: () => {
                return redirectPath('/errors/404');
            },
        },
        {
            id: 'errors.404',
            menu: false,
            path: '404',
            page: 'errors/404',
        },
        {
            id: 'errors.403',
            path: '403',
            menu: false,
            page: 'errors/403',
        },
        {
            id: 'errors.500',
            path: '500',
            menu: false,
            page: 'errors/500',
        },
    ],
};

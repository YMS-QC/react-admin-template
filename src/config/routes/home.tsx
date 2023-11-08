import { RouteOption } from '@/components/router/types';
import { redirectPath } from '@/components/router/utils';

export const home: RouteOption = {
    id: 'home',
    index: true,
    menu: false,
    loader: () => {
        return redirectPath('/dashboard/monitor');
    },
};

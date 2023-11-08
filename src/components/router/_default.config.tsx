import { Spinner } from '../spinner';

import { RouterConfig } from './types';

export const getDefaultRouterConfig: <M extends RecordNever>() => RouterConfig<M> = () => ({
    basename: '/',
    hash: false,
    loading: () => <Spinner name="Box" center />,
    routes: [],
    auth: { enabled: true, path: '/auth/login', page: 'auth/login' },
});

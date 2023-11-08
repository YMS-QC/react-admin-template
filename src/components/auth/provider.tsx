import { isNil } from 'lodash';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';

import { config } from '@/config';

// import { useFetcher } from '../fetcher/hooks';
import { FetcherStore } from '../fetcher/store';

import { AuthContext } from './constants';
import { IAuth } from './type';

const Auth: FC<{ children?: ReactNode }> = ({ children }) => {
    const token = FetcherStore((state) => state.token);
    // const fetcher = useFetcher();
    const [auth, setAuth] = useState<IAuth | null>(null);
    const { api, error } = config().auth ?? {};
    const requested = useRef(false);
    useEffect(() => {
        const getInfo = async () => {
            if (isNil(token) || isNil(api)) {
                setAuth(null);
            } else {
                try {
                    // const { data } = { data: };
                    // await fetcher.get(api);
                    setAuth({ username: '张三', permissions: ['1', '2', '3'] });
                } catch (err) {
                    setAuth(null);
                    !isNil(error) ? error() : console.log(err);
                }
            }
        };
        if (requested.current) getInfo();
        return () => {
            requested.current = true;
        };
    }, [token, api, error]);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
export default Auth;

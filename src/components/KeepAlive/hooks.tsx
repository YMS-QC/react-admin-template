import { isNil } from 'lodash';
import { useCallback } from 'react';

import { useNavigator } from '../router/hooks';

import { AliveActionType } from './constants';
import { KeepAliveStore } from './store';

export const useActivedAlive = () => KeepAliveStore(useCallback((state) => state.active, []));
export const useKeepAlives = () => KeepAliveStore(useCallback((state) => state.lives, []));
export const useKeepAliveDispath = () => {
    const navigate = useNavigator();
    const removeAlive = useCallback(
        (id: string) => {
            KeepAliveStore.dispatch({
                type: AliveActionType.REMOVE,
                params: { id, navigate },
            });
        },
        [navigate],
    );
    const removeAlives = useCallback(
        (ids: string[]) => {
            KeepAliveStore.dispatch({
                type: AliveActionType.REMOVE_MULTI,
                params: { ids, navigate },
            });
        },
        [navigate],
    );

    const changeAlive = useCallback(
        (id: string) => {
            KeepAliveStore.dispatch({
                type: AliveActionType.CHANGE,
                params: { id, navigate },
            });
        },
        [navigate],
    );
    const clearAlives = useCallback(() => {
        KeepAliveStore.dispatch({
            type: AliveActionType.CLEAR,
            navigate,
        });
    }, [navigate]);
    const refreshAlive = useCallback(
        (id: string | null) => {
            KeepAliveStore.dispatch({
                type: AliveActionType.RESET,
                params: { id, navigate },
            });
            if (!isNil(id) && navigate) navigate({ id });
        },
        [navigate],
    );
    return { changeAlive, removeAlive, removeAlives, clearAlives, refreshAlive };
};

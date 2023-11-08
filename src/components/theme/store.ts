import { config } from '@/config';
import { deepMerge } from '@/utils';

import { createPersistStore } from '../store';

import { defaultTheme } from './_default.config';
import { ThemeAction, ThemeState } from './types';

/**
 * 配置组件状态池
 */
export const ThemeStore = createPersistStore<ThemeState & ThemeAction, Omit<ThemeState, 'darken'>>(
    (set) => ({
        ...deepMerge(defaultTheme, config().theme ?? {}),
        changeMode: (mode) => {
            set((state) => ({ ...state, mode }));
        },
        toggleMode: () => {
            set((state) => {
                state.mode = state.mode === 'light' ? 'dark' : 'light';
            });
        },
        changeCompact: (compact) => set((state) => ({ ...state, compact })),
        toggleCompact: () =>
            set((state) => {
                state.compact = !state.compact;
            }),
    }),
    {
        name: 'theme-config',
        partialize: (state) => ({ mode: state.mode, compact: state.compact }),
        // skipHydration: true,
    },
);

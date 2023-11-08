import clsx from 'clsx';
import type { FC } from 'react';

import bgimg from '@/assets/images/login-box-bg.svg';

import CredentialForm from './credential.form';
import $styles from './login.module.css';

const Login: FC = () => {
    return (
        <div className={$styles.mainContainer}>
            <span className="-enter-x xl:hidden" />

            <div className={$styles.main}>
                <div className="flex h-full">
                    <div className={$styles.leftBlock}>
                        <div className="my-auto">
                            <div className="flex items-center justify-center">
                                <img alt="title" src={bgimg} className="w-1/2 -mt-16 -enter-x" />
                            </div>

                            <div className="mt-10 -enter-x flex items-center justify-center">
                                <div className="mt-4 text-3xl text-stone-950">登录管理面板</div>
                            </div>
                        </div>
                    </div>
                    <div className={clsx($styles.rightBlock, 'enter-x')}>
                        <div className={$styles.formBlock}>
                            <CredentialForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;

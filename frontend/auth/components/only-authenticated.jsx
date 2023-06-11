import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import authConfig from '../configs/auth-config';
import { useAuth } from '../hooks/use-auth';

const OnlyAuthenticated = (props) => {
  const router = useRouter();
  const [cookie, setCookie] = useCookies(['user']);
  const auth = useAuth();

  useEffect(() => {
    if (!router.isReady) return;

    if (!cookie.jwt) {
      if (localStorage.getItem(authConfig.userStorageName))
        localStorage.removeItem(authConfig.userStorageName);
    }

    if (
      auth.user === null &&
      !localStorage.getItem(authConfig.userStorageName)
    ) {
      if (router.asPath !== '/')
        router.replace({
          pathname: '/auth/signin',
          query: { returnUrl: router.asPath },
        });
      else router.replace('/auth/signin');
    }
  }, []);

  if (auth.loading || auth.user === null) {
    return props.fallback;
  }

  return <>{props.children}</>;
};
export default OnlyAuthenticated;

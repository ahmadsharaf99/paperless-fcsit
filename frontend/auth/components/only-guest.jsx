import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/use-auth';
import authConfig from '../configs/auth-config';

const OnlyGuest = (props) => {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!router.isReady) return;
    if (localStorage.getItem(authConfig.userStorageName)) router.replace('/');
  }, [router.route]);

  if (auth.loading || (!auth.loading && auth.user !== null))
    return props.fallback;

  return <>{props.children}</>;
};
export default OnlyGuest;

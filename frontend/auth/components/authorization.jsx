import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Spinner from '../../components/ui/spinner';
import { useAuth } from '../hooks/use-auth';

const Authorization = ({ permits, children }) => {
  const router = useRouter();
  const auth = useAuth();
  useEffect(() => {
    if (!router.isReady) return;

    if (auth.user) {
      if (router.asPath !== '/') {
        if (!permits.includes(auth.user.role)) {
          router.replace('/');
        }
      }
    }
  }, [router.events]);

  return <>{children}</>;
};

export default Authorization;

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUser, isAuthorized } from '../utils/server-checks';
import { parseCookies } from '../utils/cookie';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace('/dashboard');
  });
}

export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);

  try {
    const user = await getUser(cookie);
    const redirectPath = isAuthorized(
      ['ADMIN', 'LEVEL_CORD', 'STUDENT'],
      user,
      context
    );
    if (redirectPath !== undefined) return redirectPath;
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

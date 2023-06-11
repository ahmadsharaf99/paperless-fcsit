import axios from 'axios';

export const getUser = async (cookie) => {
  try {
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });
    console.log('User', userRes.data.data);
    return userRes.data.data;
  } catch (err) {
    return err;
  }
};
export const isAuthorized = (authorized = [], user, context) => {
  let currentPagePath = context.req.url;
  currentPagePath = currentPagePath.replace('/_next/data/development', '');
  currentPagePath = currentPagePath.replace('.json', '');

  if (!user.is_verified) {
    if (currentPagePath !== '/auth/verify')
      return {
        redirect: {
          destination: '/auth/verify',
          permanent: false,
        },
      };
  } else if (!user.is_password_changed) {
    if (currentPagePath !== '/auth/change-password')
      return {
        redirect: {
          destination: '/auth/change-password',
          permanent: false,
        },
      };
  } else if (!authorized.includes(user.role)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};
export const isVerified = (cookie) => {};

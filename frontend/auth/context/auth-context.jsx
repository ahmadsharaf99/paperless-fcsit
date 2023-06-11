import { useState, useEffect, createContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import authConfig from '../configs/auth-config';
import { useCookies } from 'react-cookie';

const defaultValues = {
  user: null,
  setUser: () => null,
  loading: true,
  setLoading: () => Boolean,
  isInitialized: false,
  setInitialized: () => Boolean,
  isAllowed: (roles = []) => Boolean,
  signIn: ({ username, password }) => Promise.resolve(),
  signOut: () => Promise.resolve(),
  check: (statusCode) => {},
};
const AuthContext = createContext(defaultValues);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultValues.user);
  const [loading, setLoading] = useState(defaultValues.loading);
  const [isInitialized, setInitialized] = useState(defaultValues.isInitialized);
  const [cookie, setCookie, removeCookie] = useCookies(['jwt']);

  const router = useRouter();
  useEffect(() => {
    const initAuth = async () => {
      setInitialized(true);
      const storedToken = cookie.jwt;
      console.log('token', storedToken);
      if (!cookie.jwt) {
        if (localStorage.getItem(authConfig.userStorageName))
          localStorage.removeItem(authConfig.userStorageName);
      }
      if (storedToken) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${process.env.API_BASE_URL}/core/me`,
            {
              headers: { Authorization: `${storedToken}` },
            }
          );
          const user = response.data.data;
          setUser(user);
          localStorage.setItem(
            authConfig.userStorageName,
            JSON.stringify(user)
          );
          if (!user.is_verified) {
            router.replace('/auth/verify');
          } else if (!user.is_password_changed) {
            router.replace('/auth/change-password');
          }
          setLoading(false);
        } catch (err) {
          localStorage.removeItem(authConfig.userStorageName);
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signInHandler = async (body) => {
    try {
      const authRes = await axios.post(
        `${process.env.API_BASE_URL}/auth/jwt/create`,
        body
      );

      const returnUrl = router.query.returnUrl;

      setCookie('jwt', `JWT ${authRes.data.access}`, {
        path: '/',
        sameSite: true,
      });

      const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
        headers: { Authorization: `JWT ${authRes.data.access}` },
      });

      const user = userRes.data.data;
      setUser(user);
      localStorage.setItem(authConfig.userStorageName, JSON.stringify(user));

      const redirectUrl = returnUrl && returnUrl !== '/' ? returnUrl : '/';

      router.replace(redirectUrl);
    } catch (err) {
      throw err;
    }
  };
  const signOutHandler = () => {
    setUser(null);
    setInitialized(false);
    localStorage.removeItem(authConfig.userStorageName);
    removeCookie('jwt', { path: '/' });
    router.push('/auth/signin');
  };

  const isAllowed = (roles = []) => {
    roles = roles.includes('Admin') ? roles : [...roles, 'Admin'];
    return roles.includes(user.role);
  };

  const authCheckHandler = (statusCode) => {
    if (statusCode === 401) {
      signOutHandler();
    }
  };
  const values = {
    user,
    setUser,
    loading,
    setLoading,
    isInitialized,
    setInitialized,
    isAllowed,
    signIn: signInHandler,
    signOut: signOutHandler,
    check: authCheckHandler,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthContext;

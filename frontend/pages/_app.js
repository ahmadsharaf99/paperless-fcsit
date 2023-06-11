import { CookiesProvider } from 'react-cookie';

import 'boxicons/css/boxicons.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import SSRProvider from 'react-bootstrap/SSRProvider';

import Layout from '../components/layout/layout';
import GuardPages from '../auth/components/guard-pages';
import { AuthProvider } from '../auth/context/auth-context';
import { UIContextProvider } from '../context/ui-context';

import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  const onlyAuthenticated = Component.onlyAuthenticated ?? true;
  const onlyGuest = Component.onlyGuest ?? false;

  return (
    <CookiesProvider>
      <AuthProvider>
        <SSRProvider>
          <GuardPages
            onlyAuthenticated={onlyAuthenticated}
            onlyGuest={onlyGuest}
          >
            <UIContextProvider>
              {getLayout(<Component {...pageProps} />)}
            </UIContextProvider>
          </GuardPages>
        </SSRProvider>
      </AuthProvider>
    </CookiesProvider>
  );
}

export default MyApp;

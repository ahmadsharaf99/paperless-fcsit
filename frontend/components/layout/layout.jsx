import Alert from '../ui/alert';
import Footer from './footer';
import Header from './header';

const Layout = (props) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1">{props.children}</div>
      <Footer />
      <Alert />
    </div>
  );
};
export default Layout;

import Spinner from '../../components/ui/spinner';
import OnlyAuthenticated from './only-authenticated';
import OnlyGuest from './only-guest';

const GuardPages = (props) => {
  console.log('Guard Component');
  if (props.onlyGuest) {
    return <OnlyGuest fallback={<Spinner />}>{props.children}</OnlyGuest>;
  } else if (!props.onlyAuthenticated && !props.onlyGuest) {
    return <>{props.children}</>;
  } else {
    return (
      <OnlyAuthenticated fallback={<Spinner />}>
        {props.children}
      </OnlyAuthenticated>
    );
  }
};
export default GuardPages;

import Alert from '../ui/alert';

const BlankLayout = (props) => {
  return (
    <>
      {props.children} <Alert />
    </>
  );
};

export default BlankLayout;

const ActionButton = (props) => {
  return (
    <button
      className={`btn text-${props.variant || ''} px-1 mx-1`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
export default ActionButton;

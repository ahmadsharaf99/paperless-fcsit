const Box = (props) => {
  return (
    <div className={`bg-${props.bg || 'white'} p-4 rounded-3 shadow`}>
      {props.title && <h5 className="mb-3">{props.title}</h5>}
      {props.children}
    </div>
  );
};
export default Box;

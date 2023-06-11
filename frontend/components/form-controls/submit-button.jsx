const SubmitButton = (props) => {
  return (
    <div className="d-flex flex-column  justify-content-end mt-2">
      <button
        className={`btn ${
          props.bg ? 'btn-' + props.bg : 'btn-primary'
        } rounded-3 px-5 py-2 fs-6`}
      >
        {props.title}
      </button>
    </div>
  );
};
export default SubmitButton;

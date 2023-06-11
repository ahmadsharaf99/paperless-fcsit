const SummaryBox = (props) => {
  return (
    <div className="col-lg-2">
      <div className="d-flex align-items-center ">
        <div
          className={`p-2 bg-${props.color || 'primary'} text-${
            props.color || 'primary'
          } bg-opacity-50 rounded-2 me-2`}
        >
          {props.icon}
        </div>
        <div>
          <h5 className="p-0 m-0">{props.value}</h5>
          <p className="p-0 m-0 form-text text-nowrap">{props.label}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryBox;

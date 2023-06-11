const FilterComponent = (props) => {
  return (
    <div className="d-flex justify-content-end">
      <input
        type="text"
        placeholder={props.placeholder}
        onChange={props.onFilter}
        className="px-2 py-1 rounded-start border"
        style={{ outline: 'none' }}
        value={props.filterText}
      />
      <button
        className="btn btn-secondary rounded-0 rounded-end"
        onClick={props.onClear}
      >
        <i className="bx bx-x text-white"></i>
      </button>
    </div>
  );
};

export default FilterComponent;

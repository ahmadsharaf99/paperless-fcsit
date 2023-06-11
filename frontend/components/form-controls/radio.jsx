const Radio = ({ name, value, title, register, required }) => {
  return (
    <>
      <label className="form-label">
        <input
          type="radio"
          name={name}
          value={value}
          {...register(name, { required })}
        />
        <span className="ms-1 me-3">{title}</span>
      </label>
    </>
  );
};

export default Radio;

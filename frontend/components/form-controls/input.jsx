const Input = ({
  label,
  type,
  name,
  ref,
  register,
  required,
  errors,
  style,
  classes,
  autoComplete,
  onChange,
}) => {
  return (
    <div className="py-1">
      <label htmlFor="" className={`form-label fw-bold`}>
        {label}:
      </label>
      <input
        type={type}
        className={`form-control py-2 px-2 shadow-none ${classes}`}
        placeholder={label}
        ref={ref}
        {...register(name, { required })}
        style={{ ...style }}
        autoComplete={autoComplete}
        onChange={onChange}
      />
      {errors[name] && (
        <p className="form-text text-danger p-0 m-0">{errors[name].message}</p>
      )}
    </div>
  );
};
export default Input;

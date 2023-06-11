const Select = ({
  label,
  name,
  ref,
  register,
  required,
  errors,
  children,
  classes,
  onChange,
}) => {
  return (
    <div className="py-1">
      <label htmlFor="" className="form-label fw-bold">
        {label}:
      </label>
      <select
        className={`form-select py-2 px-2 shadow-none ${classes}`}
        ref={ref}
        {...register(name, { required })}
        onChange={onChange}
      >
        {children}
      </select>
      {errors[name] && (
        <p className="form-text text-danger p-0 m-0">{errors[name].message}</p>
      )}
    </div>
  );
};
export default Select;

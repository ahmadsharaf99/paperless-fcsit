import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PageHeader from '../../components/layout/page-title';
import Input from '../../components/form-controls/input';
import SubmitButton from '../../components/form-controls/submit-button';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useUI } from '../../hooks/use-ui';

const defaultValues = {
  username: '',
  email: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
};
const AddStaff = () => {
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const staffSchema = yup.object().shape({
    username: yup.string().required(),
    email: yup.string().email().required(),
    first_name: yup.string(),
    middle_name: yup.string(),
    last_name: yup.string().required(),
    phone_number: yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(staffSchema),
  });

  const addStaffHandler = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/staff/auth/`,
        data,
        {
          headers: { Authorization: `${cookie.jwt}` },
        }
      );
      const {
        username,
        email,
        first_name,
        last_name,
        middle_name,
        phone_number,
        role,
      } = response.data;

      const message = `${first_name} ${middle_name} ${last_name} | ${username} added successfully`;
      console.log(response.data);
      reset(defaultValues);
      ui.setAlertMessage(message, 'success');
    } catch (err) {
      const res = err.response.data;
      const errors = [];

      Object.keys(res).map((err) => {
        if (Array.isArray(res[err])) {
          errors.push({ message: res[err][0], field: err });
        } else {
          errors.push({ message: res[err] });
        }
      });

      if (errors[0].field) {
        Object.keys(data).map((field) => {
          let fieldError = errors.find((error) => error.field === field);
          setError(field, {
            type: 'manual',
            message: fieldError?.message,
          });
        });
      } else {
        ui.setAlertMessage(errors[0].message, 'error');
      }
    }
  };
  return (
    <div className="container">
      <PageHeader title="Add Staff" />
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addStaffHandler)}
            autoComplete="off"
          >
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="First name"
                  name="first_name"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  label="Middle name"
                  name="middle_name"
                  required={false}
                  register={register}
                  errors={errors}
                  autoComplete="on"
                />
              </div>
              <div className="col-lg-12">
                <Input
                  label="Last name"
                  name="last_name"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="Username"
                  name="username"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  label="Phone"
                  name="phone_number"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <SubmitButton title="Add Staff" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;

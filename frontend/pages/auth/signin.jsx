import Input from '../../components/form-controls/input';
import Logo from '../../components/ui/logo';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SubmitButton from '../../components/form-controls/submit-button';

import BlankLayout from '../../components/layout/blank-layout';
import { useUI } from '../../hooks/use-ui';
import { useAuth } from '../../auth/hooks/use-auth';
import { useState } from 'react';

const SignIn = () => {
  const auth = useAuth();
  const ui = useUI();

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const signInSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { username: '', password: '' },
    mode: 'all',
    resolver: yupResolver(signInSchema),
  });

  const signInHandler = async (data) => {
    try {
      setErrorMessage(null);
      await auth.signIn(data);
    } catch (err) {
      console.log(err);
      const errors = err;
      // console.log(errors.response.data);

      setErrorMessage(err.response.data.detail);
      setShowError(true);

      // if (errors[0].field) {
      //   Object.keys(data).map((field) => {
      //     let fieldError = errors.find((error) => error.field === field);
      //     setError(field, {
      //       type: 'manual',
      //       message: fieldError?.message,
      //     });
      //   });
      // } else {
      //   ui.setAlertMessage(errors[0].message, 'error');
      // }
    }
  };
  return (
    <div className="container d-flex flex-column justify-content-center min-vh-100">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-4 ">
          <div className="d-flex flex-column align-items-center">
            <Logo src="/images/logo.jpg" width={70} height={70} />
            <h5 className="mt-4">Login</h5>
          </div>
          <form
            action=""
            onSubmit={handleSubmit(signInHandler)}
            autoComplete="off"
          >
            <Input
              label="Username"
              name="username"
              required={true}
              register={register}
              errors={errors}
              autoComplete="off"
            />
            <Input
              type="password"
              name="password"
              label="Password"
              register={register}
              errors={errors}
              required
              autoComplete="off"
            />
            <SubmitButton title="Login" />
          </form>
          {showError && <div className="text-danger mt-2">{errorMessage}</div>}

          <p className="form-text text-center">Final year project 2023</p>
        </div>
      </div>
    </div>
  );
};

SignIn.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
SignIn.onlyGuest = true;
export default SignIn;

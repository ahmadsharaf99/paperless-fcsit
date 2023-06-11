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
import { parseCookies } from '../../utils/cookie';
import { getUser, isAuthorized } from '../../utils/server-checks';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';

const defaultValues = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};
const ChangePassword = () => {
  const router = useRouter();
  const auth = useAuth();
  const ui = useUI();

  const [cookie, setCookie] = useCookies(['jwt']);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const verifySchema = yup.object().shape({
    current_password: yup.string().required(),
    new_password: yup.string().required(),
    confirm_password: yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: 'all',
    resolver: yupResolver(verifySchema),
  });

  const changePasswordHandler = async (data) => {
    try {
      setErrorMessage(null);
      const response = await axios.put(
        `${process.env.API_BASE_URL}/core/change-password/`,
        data,
        { headers: { Authorization: `${cookie.jwt}` } }
      );
      auth.signOut();
      // router.reload();
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
        // ui.setAlertMessage(errors[0].message, 'error');

        setErrorMessage(errors[0].message);

        setShowError(true);
      }
      if (err.response.data.non_field_errors) {
        setErrorMessage(err.response.data?.non_field_errors[0]);
        setShowError(true);
      }

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
            <h5 className="mt-4">Change Password</h5>
          </div>
          <form
            action=""
            onSubmit={handleSubmit(changePasswordHandler)}
            autoComplete="off"
          >
            <Input
              type="password"
              label="Current password"
              name="current_password"
              required={true}
              register={register}
              errors={errors}
              autoComplete="off"
            />
            <Input
              type="password"
              label="New password"
              name="new_password"
              required={true}
              register={register}
              errors={errors}
              autoComplete="off"
            />{' '}
            <Input
              type="password"
              label="Confirm password"
              name="confirm_password"
              required={true}
              register={register}
              errors={errors}
              autoComplete="off"
            />
            <SubmitButton title="Change password" />
            <button className="btn w-100" onClick={auth.signOut}>
              Logout
            </button>
          </form>
          {showError && <div className="text-danger mt-2">{errorMessage}</div>}

          <p className="form-text text-center">Final year project 2023</p>
        </div>
      </div>
    </div>
  );
};

ChangePassword.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
// Verify.onlyGuest = true;
export default ChangePassword;

// export async function getServerSideProps(context) {
//   const cookie = parseCookies(context.req);

//   try {
//     const user = await getUser(cookie);
//     const redirectPath = isAuthorized(['ADMIN'], user, context);
//     if (redirectPath !== undefined) return redirectPath;
//   } catch (err) {
//     console.log(err);
//   }
//   return {
//     props: {},
//   };
// }

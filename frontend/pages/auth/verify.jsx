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
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useRouter } from 'next/router';

const Verify = () => {
  const router = useRouter();

  const auth = useAuth();
  const ui = useUI();

  const [cookie, setCookie] = useCookies(['jwt']);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const verifySchema = yup.object().shape({
    otp_code: yup.string().required(),
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { otp_code: '' },
    mode: 'all',
    resolver: yupResolver(verifySchema),
  });

  const verifyHandler = async (data) => {
    try {
      setErrorMessage(null);
      const response = await axios.post(
        `${process.env.API_BASE_URL}/core/verify/`,
        data,
        { headers: { Authorization: `${cookie.jwt}` } }
      );
      router.reload();
    } catch (err) {
      console.log(err);
      const errors = err;
      console.log(errors);

      setErrorMessage(err.response.data.error);
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
            <h5 className="mt-4">Verify OTP</h5>
          </div>
          <form
            action=""
            onSubmit={handleSubmit(verifyHandler)}
            autoComplete="off"
          >
            <Input
              label="OTP"
              name="otp_code"
              required={true}
              register={register}
              errors={errors}
              autoComplete="off"
            />

            <SubmitButton title="Verify OTP" />

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

Verify.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
// Verify.onlyGuest = true;
export default Verify;

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

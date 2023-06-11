import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PageHeader from '../../components/layout/page-title';
import Input from '../../components/form-controls/input';
import SubmitButton from '../../components/form-controls/submit-button';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useUI } from '../../hooks/use-ui';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import { parseCookies } from '../../utils/cookie';
import Select from '../../components/form-controls/select';

const defaultValues = {
  session: '',
  is_update_student_levels: false,
  is_update_level_cord: false,
};
const AddSession = () => {
  const router = useRouter();
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const sessionSchema = yup.object().shape({
    session: yup.string().required(),
    is_update_student_levels: yup.boolean(),
    is_update_level_cord: yup.boolean(),
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
    resolver: yupResolver(sessionSchema),
  });

  const addSessionHandler = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/administration/academic-session/`,
        data,
        { headers: { Authorization: `${cookie.jwt}` } }
      );
      const { session } = response.data;

      const message = `${session} session added successfully`;
      reset(defaultValues);
      ui.setAlertMessage(message, 'success');
    } catch (err) {
      const res = err.response.data;
      const errors = [];
      console.log(res);

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
      <div className="d-flex justify-content-between align-items-center">
        <PageHeader title="Add Session" />
        <div>
          <Link href={`/academic-sessions`} className="btn btn-warning me-2 ">
            <ArrowBackIcon /> Sessions
          </Link>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addSessionHandler)}
            autoComplete="off"
          >
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="Session"
                  name="session"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
                <Select
                  name="is_update_student_levels"
                  label="Update student levels"
                  register={register}
                  errors={errors}
                >
                  <option value={false}>False</option>
                  <option value={true}>True</option>
                </Select>
                <Select
                  name="is_update_level_cord"
                  label="Update level coord"
                  register={register}
                  errors={errors}
                >
                  <option value={false}>False</option>
                  <option value={true}>True</option>
                </Select>
                <div className="d-flex justify-content-end">
                  <SubmitButton title="Add Session" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSession;

export async function getServerSideProps(context) {
  try {
    const cookie = parseCookies(context.req);
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });

    if (!['ADMIN'].includes(userRes.data.data.role)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

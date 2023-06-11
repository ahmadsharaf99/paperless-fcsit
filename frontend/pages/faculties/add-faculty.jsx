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

const defaultValues = {
  faculty_name: '',
  faculty_code: '',
  established_date: '',
};
const AddFaculty = () => {
  const router = useRouter();
  const { facultyId } = router.query;
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const staffSchema = yup.object().shape({
    faculty_name: yup.string().required(),
    faculty_code: yup.string().required(),
    established_date: yup.string(),
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

  const addFacultyHandler = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/divisions/faculties/`,
        data,
        {
          headers: { Authorization: `${cookie.jwt}` },
        }
      );
      const { faculty_name, faculty_code, established_date } = response.data;

      const message = `${faculty_name} (${faculty_code}) added successfully`;
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
      <div className="d-flex justify-content-between align-items-center">
        <PageHeader title="Add Faculty" />
        <div>
          <Link href={`/faculties`} className="btn btn-warning me-2 ">
            <ArrowBackIcon /> Faculties
          </Link>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addFacultyHandler)}
            autoComplete="off"
          >
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="Faculty name"
                  name="faculty_name"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  label="Faculty code"
                  name="faculty_code"
                  required={false}
                  register={register}
                  errors={errors}
                  autoComplete="on"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="date"
                  label="Established date"
                  name="established_date"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="d-flex justify-content-end">
              <SubmitButton title="Add Faculty" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;

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

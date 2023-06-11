import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Input from '../../../components/form-controls/input';
import SubmitButton from '../../../components/form-controls/submit-button';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../hooks/use-ui';
import { useEffect, useState } from 'react';
// import Select from '../../components/form-controls/select';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/layout/page-title';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { parseCookies } from '../../../utils/cookie';

const defaultValues = {
  dept_name: '',
  dept_code: '',
  established_date: '',
  // faculty: '',
};
const AddFaculty = (props) => {
  const router = useRouter();
  const { facultyId } = router.query;

  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const staffSchema = yup.object().shape({
    dept_name: yup.string().required(),
    dept_code: yup.string().required(),
    established_date: yup.string(),
    // faculty: yup.string().required(),
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

  const addDepartmentHandler = async (data) => {
    // const facultyId = Number(data.faculty);
    // delete data.faculty;
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}/departments/`,
        data,
        {
          headers: { Authorization: `${cookie.jwt}` },
        }
      );
      const { dept_name, dept_code, established_date } = response.data;

      const message = `${dept_name} (${dept_code}) added successfully`;
      console.log(response.data);
      reset(defaultValues);
      ui.setAlertMessage(message, 'success');
    } catch (err) {
      console.log(err);
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
        <PageHeader
          title="Add Department"
          description={props.faculty.faculty_name}
        />
        <div>
          <Link
            href={`/faculties/${facultyId}/departments`}
            className="btn btn-warning me-2 "
          >
            <ArrowBackIcon /> Departments
          </Link>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addDepartmentHandler)}
            autoComplete="off"
          >
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="Department name"
                  name="dept_name"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  label="Department code"
                  name="dept_code"
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
            {/* <div className="col-lg-6">
              <Select
                label="Faculty"
                name="faculty"
                register={register}
                errors={errors}
              >
                <option value="">---choose faculty---</option>
                {faculties.map((faculty, index) => (
                  <option key={index} value={faculty.id}>
                    {faculty.faculty_name}
                  </option>
                ))}
              </Select>
            </div> */}
            <div className="d-flex justify-content-end">
              <SubmitButton title="Add Department" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;

export async function getServerSideProps(context) {
  const { facultyId } = context.params;
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

    const facultyRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );

    return {
      props: {
        faculty: facultyRes.data,
      },
    };
  } catch (err) {
    console.log(err.message);
    return {
      redirect: {
        destination: `/faculties/${facultyId}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

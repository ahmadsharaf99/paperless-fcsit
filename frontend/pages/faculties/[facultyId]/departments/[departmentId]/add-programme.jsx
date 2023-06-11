import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import PageHeader from '../../../../../components/layout/page-title';
import Input from '../../../../../components/form-controls/input';
import SubmitButton from '../../../../../components/form-controls/submit-button';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../../../hooks/use-ui';
import { useEffect, useState } from 'react';
import Select from '../../../../../components/form-controls/select';
import { parseCookies } from '../../../../../utils/cookie';
import { useRouter } from 'next/router';
import Link from 'next/link';

const defaultValues = {
  prog_name: '',
  prog_duration: '',
  established_date: '',
  faculty: '',
  department: '',
};
const AddProgramme = (props) => {
  const router = useRouter();
  const { facultyId, departmentId } = router.query;
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const programmeSchema = yup.object().shape({
    prog_name: yup.string().required(),
    prog_duration: yup.string().required(),
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
    resolver: yupResolver(programmeSchema),
  });

  const addProgrammeHandler = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/programmes/`,
        data,
        {
          headers: { Authorization: `${cookie.jwt}` },
        }
      );
      const { prog_name } = response.data;

      const message = `${prog_name} added successfully`;

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
        <PageHeader
          title={`Add Programme`}
          description={`${props.department.dept_name}`}
        />
        <div>
          <Link
            href={`/faculties/${facultyId}/departments/${departmentId}/programmes`}
            className="btn btn-warning me-2 "
          >
            <ArrowBackIcon /> Programmes
          </Link>
        </div>
      </div>

      <div className="d-flex justify-content-end"></div>
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addProgrammeHandler)}
            autoComplete="off"
          >
            <div className="row">
              <div className="col-lg-6">
                <Input
                  label="Programme name"
                  name="prog_name"
                  required={true}
                  register={register}
                  errors={errors}
                  autoComplete="off"
                />
              </div>
              <div className="col-lg-6">
                <Input
                  type="number"
                  label="Duration"
                  name="prog_duration"
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
              <SubmitButton title="Add Programme" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProgramme;

export async function getServerSideProps(context) {
  const { facultyId, departmentId } = context.params;
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

    const departmentRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );

    console.log(departmentRes.data);

    return {
      props: {
        department: departmentRes.data,
      },
    };
  } catch (err) {
    console.log(err.message);
    return {
      redirect: {
        destination: `/faculties/${facultyId}/departments`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

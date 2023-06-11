import { useRouter } from 'next/router';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import PageHeader from '../../../components/layout/page-title';
import Link from 'next/link';
import { parseCookies } from '../../../utils/cookie';
import axios from 'axios';
import { getUser, isAuthorized } from '../../../utils/server-checks';
import Input from '../../../components/form-controls/input';
import { useState } from 'react';
import Select from '../../../components/form-controls/select';
import SubmitButton from '../../../components/form-controls/submit-button';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../hooks/use-ui';

const AssignStaff = (props) => {
  const ui = useUI();
  const router = useRouter();
  const [cookie, setCookie] = useCookies(['jwt']);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showUpdateAssignment, setShowUpdateAssignment] = useState(false);

  const [programmes, setProgrammes] = useState(props.programmes ?? []);

  const defaultValues = {
    staff: props.staff.id,
    programme: '',
    assigned_level: '',
  };

  const assignSchema = yup.object().shape({
    staff: yup.string().required(),
    programme: yup.string().required(),
    assigned_level: yup.string().required(),
  });

  const {
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(assignSchema),
  });
  const assignHandler = async (data) => {
    setErrorMessage(null);
    setShowError(false);
    try {
      const res = await axios.post(
        `${process.env.API_BASE_URL}/staff/assign/`,
        data,
        { headers: { Authorization: cookie.jwt } }
      );

      ui.setAlertMessage('Level assigned successfully', 'success');
      console.log(res);
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
        // ui.setAlertMessage(errors[0].message, 'error');

        setErrorMessage(errors[0].message);

        setShowError(true);
      }
      if (
        err.response.data.non_field_errors &&
        err.response.data.non_field_errors[0] ===
          'The fields programme, assigned_level must make a unique set.'
      ) {
        try {
          const getAssignment = await axios.get(
            `${process.env.API_BASE_URL}/staff/get-assign-id/${data.programme}/${data.assigned_level}`,
            { headers: { Authorization: cookie.jwt } }
          );

          const updateAssignment = await axios.patch(
            `${process.env.API_BASE_URL}/staff/assign/${getAssignment.data['assignment-id']}/`,
            {
              staff: props.staff.id,
              programme: data.programme,
              assigned_level: data.assigned_level,
            },
            { headers: { Authorization: cookie.jwt } }
          );

          console.log('getAssigned', updateAssignment);
          ui.setAlertMessage(
            'Level assignment changed successfully',
            'success'
          );
        } catch (err) {
          console.log('inner error', err);
        }
        // console.error(
        //   'Level coord assignment',
        //   err.response.data?.non_field_errors[0]
        // );
        // setErrorMessage('This level already have a level coordinator');
        // setShowError(true);
        // setUpdateAssignment(true);
      }
    }
    console.log(data);
  };
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <PageHeader
          title="Assign Staff"
          description={`${props.staff.first_name} ${
            props.staff.middle_name ?? ''
          } ${props.staff.last_name}`}
        />
        <div>
          <Link href={`/staff`} className="btn btn-warning me-2 ">
            <ArrowBackIcon /> Staff
          </Link>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <form action="" onSubmit={handleSubmit(assignHandler)}>
            <input
              type="hidden"
              name="staff"
              {...register('staff')}
              value={props.staff.id}
            />
            <Select
              label="Programme"
              name="programme"
              register={register}
              errors={errors}
            >
              <option value="">----Choose a programme----</option>
              {programmes.map((programme, index) => (
                <option value={programme.id} key={index}>
                  {programme.prog_name}
                </option>
              ))}
            </Select>
            <Select
              name="assigned_level"
              label="Assigned level"
              register={register}
              errors={errors}
              required={true}
            >
              <option value="">----Choose a level----</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">Spill Over 1</option>
              <option value="600">Spill Over 2</option>
              <option value="700">Spill Over 3</option>
            </Select>
            <div className="d-flex justify-content-end">
              <SubmitButton title="Assign to Level" />
            </div>
          </form>
          {showError && <div className="text-danger mt-2">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};
export default AssignStaff;

export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  const { staffId } = context.params;

  try {
    const user = await getUser(cookie);
    const redirectPath = isAuthorized(['ADMIN'], user, context);
    if (redirectPath !== undefined) return redirectPath;

    const staff = await axios.get(
      `${process.env.API_BASE_URL}/staff/auth/${staffId}/`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );

    console.log('staff', staff.data);
    let programmes = [];
    if (staff.data.department_id) {
      const programmesRes = await axios.get(
        `${process.env.API_BASE_URL}/divisions/departments/${staff.data.department_id}/programmes/`,
        { headers: { Authorization: `${cookie.jwt}` } }
      );
      programmes = programmesRes.data.results;
    }

    return {
      props: {
        programmes: programmes,
        staff: staff.data,
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return {
        redirect: {
          destination: '/staff',
          permanent: false,
        },
      };
    }
    console.error('error', err.response?.status);
  }
  return {
    props: {},
  };
}

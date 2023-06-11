import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PageHeader from '../../components/layout/page-title';
import Input from '../../components/form-controls/input';
import SubmitButton from '../../components/form-controls/submit-button';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useUI } from '../../hooks/use-ui';
import Select from '../../components/form-controls/select';
import { parseCookies } from '../../utils/cookie';
import { useEffect, useState } from 'react';

const defaultValues = {
  reg_number: '',
  email: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
  current_level: '',
  mode_entry: '',
  mode_study: '',
  entry_status: '',
  jamb_number: '',
  faculty: '',
  department: '',
  programme: '',
};
const AddStudent = (props) => {
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const [faculties, setFaculties] = useState(props.faculties ?? []);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [facultyId, setFacultyId] = useState(0);
  const [departmentId, setDepartmentId] = useState(0);

  const studentSchema = yup.object().shape({
    reg_number: yup.string().required(),
    email: yup.string().email().required(),
    first_name: yup.string().required(),
    middle_name: yup.string(),
    last_name: yup.string().required(),
    phone_number: yup.string().required(),
    current_level: yup.string().required(),
    mode_entry: yup.string().required(),
    mode_study: yup.string().required(),
    entry_status: yup.string().required(),
    jamb_number: yup.string().required(),
    faculty: yup.string().required(),
    department: yup.string().required(),
    programme: yup.string().required(),
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
    resolver: yupResolver(studentSchema),
  });

  useEffect(() => {
    const getFacultyDepartments = async () => {
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}/departments/`,
          { headers: { Authorization: `${cookie.jwt}` } }
        );
        setDepartments(response.data.results);
      } catch (err) {}
    };
    getFacultyDepartments();
  }, [facultyId]);

  useEffect(() => {
    const getDepartmentProgrammes = async () => {
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/programmes`,
          { headers: { Authorization: `${cookie.jwt}` } }
        );
        setProgrammes(response.data.results);
      } catch (err) {
        console.log(err);
      }
    };
    getDepartmentProgrammes();
  }, [departmentId]);
  const addStudentHandler = async (data) => {
    try {
      const onboarding = await axios.post(
        `${process.env.API_BASE_URL}/students/auth/`,
        data,
        { headers: { Authorization: `${cookie.jwt}` } }
      );

      console.log('OnBoarding', onboarding);
      const getAcademicRecordId = await axios.get(
        `${process.env.API_BASE_URL}/core/get-acad-id/${onboarding.data.id}`,
        { headers: { Authorization: `${cookie.jwt}` } }
      );

      const academicRecord = await axios.put(
        `${process.env.API_BASE_URL}/students/academic-records/${getAcademicRecordId.data.acad_record_id}/`,
        { ...data, student: onboarding.data.id },
        { headers: { Authorization: `${cookie.jwt}` } }
      );

      console.log('Academic Record', academicRecord);

      const {
        reg_number,
        email,
        first_name,
        last_name,
        middle_name,
        phone_number,
        role,
      } = onboarding.data;

      const message = `${first_name} ${middle_name} ${last_name} | ${reg_number} added successfully`;
      // console.log(response.data);
      reset(defaultValues);
      ui.setAlertMessage(message, 'success');
    } catch (err) {
      console.log(err);
      // ui.setAlertMessage(err.response)
      const res = err.response?.data;
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
      <PageHeader title="Add Student" />
      <div className="row">
        <div className="col-lg-8">
          <form
            action=""
            onSubmit={handleSubmit(addStudentHandler)}
            autoComplete="off"
          >
            <fieldset>
              <legend>Student Info</legend>
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
            </fieldset>
            <fieldset>
              <legend>Academic Details</legend>

              <div className="row">
                <div className="col-lg-6">
                  <Input
                    label="Reg Number"
                    name="reg_number"
                    required={true}
                    register={register}
                    errors={errors}
                    autoComplete="off"
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    name="jamb_number"
                    label="Jamb No"
                    required="true"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6">
                  <Select
                    name="mode_entry"
                    label="Mode of Entry"
                    register={register}
                    errors={errors}
                    required={true}
                  >
                    <option value="">---Choose mode of entry---</option>
                    <option value="DE">Direct Entry</option>
                    <option value="JAMB">JAMB</option>
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="mode_study"
                    label="Mode of Study"
                    register={register}
                    errors={errors}
                    required={true}
                  >
                    <option value="">---Choose mode of study---</option>
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="entry_status"
                    label="Entry status"
                    register={register}
                    errors={errors}
                    required={true}
                  >
                    <option value="">---Choose entry status---</option>
                    <option value="FR">Freshman</option>
                    <option value="RE">Returning</option>
                    <option value="GR">Graduated</option>
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="current_level"
                    label="Current level"
                    register={register}
                    errors={errors}
                    required={true}
                  >
                    <option value="">---Choose current level---</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">Spill Over 1</option>
                    <option value="600">Spill Over 2</option>
                    <option value="700">Spill Over 3</option>
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="faculty"
                    label="Faculty"
                    register={register}
                    errors={errors}
                    required={true}
                    onChange={(e) => {
                      setProgrammes([]);
                      setFacultyId(e.target.value);
                    }}
                  >
                    <option value="">---Choose student faculty---</option>
                    {faculties.map((faculty, index) => (
                      <option value={faculty.id} key={index}>
                        {faculty.faculty_name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="department"
                    label="Department"
                    register={register}
                    errors={errors}
                    required={true}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  >
                    <option value="">---Choose student department---</option>
                    {departments.map((department, index) => (
                      <option value={department.id} key={index}>
                        {department.dept_name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="col-lg-6">
                  <Select
                    name="programme"
                    label="Programme"
                    register={register}
                    errors={errors}
                    required={true}
                  >
                    <option value="">---Choose student programme---</option>
                    {programmes.map((programme, index) => (
                      <option value={programme.id} key={index}>
                        {programme.prog_name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </fieldset>

            <div className="d-flex justify-content-end">
              <SubmitButton title="Add Student" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;

export async function getServerSideProps(context) {
  try {
    const cookie = parseCookies(context.req);
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });

    if (!['ADMIN', 'LEVEL_CORD'].includes(userRes.data.data.role)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const facultiesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        faculties: facultiesRes.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

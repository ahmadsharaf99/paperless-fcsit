import axios from 'axios';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PageHeader from '../../../components/layout/page-title';
import { parseCookies } from '../../../utils/cookie';
import { useAuth } from '../../../auth/hooks/use-auth';
import Input from '../../../components/form-controls/input';
import Select from '../../../components/form-controls/select';
import SubmitButton from '../../../components/form-controls/submit-button';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import { useUI } from '../../../hooks/use-ui';

const ProfileInfo = (props) => {
  const auth = useAuth();
  const ui = useUI();

  const [cookie, setCookie] = useCookies(['jwt']);
  const [profile, setProfile] = useState(props.profile ?? {});
  const [profilePic, setProfilePic] = useState(
    props.profile.passport_photo ?? null
  );
  const [faculties, setFaculties] = useState(props.faculties ?? []);
  const [departments, setDepartments] = useState(props.departments ?? []);
  const [facultyId, setFacultyId] = useState(0);

  const date = new Date(profile.date_of_birth);
  const formattedDate = date.toISOString().split('T')[0];
  const defaultValues = {
    date_of_birth: '',
    gender: '',
    passport_photo: '',
    faculty: '',
    department: '',
  };

  const profileSchema = yup.object().shape({
    date_of_birth: yup.date().required(),
    gender: yup.string().required(),
    faculty: yup.string().required(),
    department: yup.string().required(),
    passport_photo: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * 200; // 200kb max file size
        return true;
      })
      .test('fileType', 'Unsupported file type', (value) => {
        if (value)
          return ['image/jpeg', 'image/png', 'image/gif'].includes(
            value[0].type
          );
        return true;
      }),
  });

  useEffect(() => {
    const getFacultyDepartments = async () => {
      try {
        if (facultyId !== 0) {
          const response = await axios.get(
            `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}/departments/`,
            { headers: { Authorization: `${cookie.jwt}` } }
          );
          setDepartments(response.data.results);
        }
      } catch (err) {}
    };
    getFacultyDepartments();
  }, [facultyId]);

  useEffect(() => {
    const date = new Date(profile.date_of_birth);
    const formattedDate = date.toISOString().split('T')[0];
    reset({
      date_of_birth: formattedDate,
      gender: profile.gender,
      faculty: profile.faculty?.id || '',
      department: profile.department?.id || '',
      passport_photo: '',
    });
    if (profile.faculty?.id) {
      setFacultyId(profile.faculty.id);
    }
  }, []);
  const {
    handleSubmit,
    reset,
    register,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(profileSchema),
  });

  const updateProfileHandler = async (data) => {
    const date = new Date(data.date_of_birth);
    const formattedDate = date.toISOString().split('T')[0];
    data.date_of_birth = formattedDate;
    const formData = new FormData();
    formData.append('date_of_birth', formattedDate);
    formData.append('gender', data.gender);
    formData.append('faculty', data.faculty);
    formData.append('department', data.department);
    formData.append('staff', profile.staff.id);

    for (const [key, value] of formData.entries()) {
      console.log('form', key, value);
    }
    if (data.passport_photo) {
      formData.append('passport_photo', data.passport_photo[0]);
    }

    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/staff/profile/me/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: cookie.jwt,
          },
        }
      );

      setProfilePic(res.data.passport_photo);
      ui.setAlertMessage('Profile updated successfully', 'success');
      console.log(res);
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
      <PageHeader
        title="Staff Profile"
        description={`${auth.user.first_name} ${auth.user.middle_name || ''} ${
          auth.user.last_name
        }`}
      />
      <section className="">
        <div className="row">
          <div className="col-lg-7">
            <form onSubmit={handleSubmit(updateProfileHandler)}>
              <h5>Staff Profile Information</h5>
              <div className="container bg-light">
                <div className="d-flex flex-column align-items-end justify-content-end">
                  <Image
                    src={
                      profilePic
                        ? `${process.env.API_BASE_URL}${profilePic}`
                        : `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                    }
                    width={150}
                    height={150}
                    alt=""
                  />
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Full name</div>
                  <div className="col fw-bold">{`${profile.staff.first_name} ${profile.staff.last_name}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Phone Number</div>
                  <div className="col fw-bold">
                    {profile.staff.phone_number}
                  </div>
                </div>
              </div>
              <Input
                type="date"
                label="Date of Birth"
                name="date_of_birth"
                register={register}
                errors={errors}
              />

              <Select
                name="gender"
                label="Gender"
                register={register}
                errors={errors}
              >
                <option value="">-----</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
              <Select
                name="faculty"
                label="Faculty"
                register={register}
                errors={errors}
                required={true}
                onChange={(e) => {
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
              <Select
                name="department"
                label="Department"
                register={register}
                errors={errors}
                required={true}
              >
                <option value="">-----</option>
                {departments.map((department, index) => (
                  <option value={department.id} key={index}>
                    {department.dept_name}
                  </option>
                ))}
              </Select>
              <Input
                type="file"
                name="passport_photo"
                label="Change Profile Pic"
                register={register}
                errors={errors}
              />
              <div className="d-flex justify-content-end">
                <SubmitButton title="Update Profile" />
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProfileInfo;
export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const profileInfo = await axios.get(
      `${process.env.API_BASE_URL}/staff/profile/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    console.log('staff profile', profileInfo.data);
    const facultiesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );
    const departmentsRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/${
        profileInfo.data.faculty?.id ?? 0
      }/departments/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        profile: profileInfo.data,
        faculties: facultiesRes.data.results,
        departments: departmentsRes.data.results,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
  return {
    props: {},
  };
}

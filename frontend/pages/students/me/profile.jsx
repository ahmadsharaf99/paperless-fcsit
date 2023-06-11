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

const ProfileInfo = (props) => {
  const auth = useAuth();
  const [cookie, setCookie] = useCookies(['jwt']);
  const [profile, setProfile] = useState(props.profile);

  const defaultValues = {
    dob: '',
    gender: 'MALE',
    marital_status: '',
    passport_photo: '',
  };

  const profileSchema = yup.object().shape({
    dob: yup.date().required(),
    gender: yup.string().required(),
    marital_status: yup.string().required(),
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
    const date = new Date(profile.dob);
    const formattedDate = date.toISOString().split('T')[0];
    reset({
      dob: formattedDate,
      gender: profile.gender,
      marital_status: profile.marital_status,
      passport_photo: '',
    });
  }, []);
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(profileSchema),
  });

  const updateProfileHandler = async (data) => {
    const date = new Date(data.dob);
    const formattedDate = date.toISOString().split('T')[0];
    data.dob = formattedDate;
    const formData = new FormData();
    formData.append('dob', formattedDate);
    formData.append('gender', data.gender);
    formData.append('marital_status', data.marital_status);

    if (data.passport_photo) {
      formData.append('passport_photo', data.passport_photo[0]);
    }

    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/students/profile/me/`,
        formData,
        { headers: { Authorization: cookie.jwt } }
      );

      setProfile(res.data);
      console.log(res);
    } catch (err) {
      console.log(err.response.data);
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
    console.log(data);
  };
  return (
    <div className="container">
      <PageHeader
        title="Student Profile"
        description={`${auth.user.first_name} ${auth.user.middle_name} ${auth.user.last_name}`}
      />
      <section className="">
        <div className="row">
          <div className="col-lg-7">
            <form onSubmit={handleSubmit(updateProfileHandler)}>
              <h5>Student Profile Information</h5>
              <div className="container bg-light">
                <div className="d-flex flex-column align-items-end justify-content-end">
                  <Image
                    src={
                      profile.passport_photo
                        ? `${process.env.API_BASE_URL}${profile.passport_photo}`
                        : `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                    }
                    width={150}
                    height={150}
                    alt=""
                  />
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Full name</div>
                  <div className="col fw-bold">{`${profile.student.first_name} ${profile.student.last_name}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Reg Number</div>
                  <div className="col fw-bold">
                    {profile.student.reg_number}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Phone Number</div>
                  <div className="col fw-bold">
                    {profile.student.phone_number}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Level Coordinator</div>
                  <div className="col fw-bold">
                    {`${profile.level_coordinator?.first_name || ''}  ${
                      profile.level_coordinator?.last_name || ''
                    } `}
                  </div>
                </div>
              </div>
              <Input
                type="date"
                label="Date of Birth"
                name="dob"
                register={register}
                errors={errors}
              />
              <Select
                name="marital_status"
                label="Marital Status"
                register={register}
                errors={errors}
              >
                <option value="">-----</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </Select>
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
      `${process.env.API_BASE_URL}/students/profile/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        profile: profileInfo.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

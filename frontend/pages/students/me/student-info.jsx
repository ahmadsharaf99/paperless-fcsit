import axios from 'axios';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import PageHeader from '../../../components/layout/page-title';
import { parseCookies } from '../../../utils/cookie';
import Input from '../../../components/form-controls/input';
import SubmitButton from '../../../components/form-controls/submit-button';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../hooks/use-ui';

const defaultValues = {
  home_address: '',
  contact_address: '',
  country: '',
  state: '',
  local_govt: '',
  full_name: '',
  phone_number: '',
  email: '',
  relationship: '',
  address: '',
};
const StudentInfo = (props) => {
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);
  useEffect(() => {
    reset({ ...props.contact, ...props.kin, ...props.origin });
  }, []);

  const studentInfoSchema = yup.object().shape({
    home_address: '',
    contact_address: yup.string(),
    country: yup.string(),
    state: yup.string(),
    local_govt: yup.string(),
    full_name: yup.string(),
    phone_number: yup.string(),
    email: yup.string(),
    relationship: yup.string(),
    address: yup.string(),
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(studentInfoSchema),
  });

  const updateStudentInfo = async (data) => {
    console.log(data);
    try {
      await axios.patch(
        `${process.env.API_BASE_URL}/students/contacts/me/`,
        data,
        {
          headers: { Authorization: cookie.jwt },
        }
      );
      await axios.patch(
        `${process.env.API_BASE_URL}/students/origins/me/`,
        data,
        {
          headers: { Authorization: cookie.jwt },
        }
      );
      await axios.patch(`${process.env.API_BASE_URL}/students/kins/me/`, data, {
        headers: { Authorization: cookie.jwt },
      });
      ui.setAlertMessage('Information updated successfully', 'success');
    } catch (err) {
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
      <PageHeader title="Student Information" />
      <div className="row">
        <div className="col-lg-7">
          <div className="row border-bottom p-2">
            <div className="col-4 border-end">Full name</div>
            <div className="col fw-bold">{`${props.contact.student.first_name} ${props.contact.student.last_name}`}</div>
          </div>
          <div className="row border-bottom p-2">
            <div className="col-4 border-end">Reg Number</div>
            <div className="col fw-bold">
              {props.contact.student.reg_number}
            </div>
          </div>
          <div className="row border-bottom p-2">
            <div className="col-4 border-end">Phone Number</div>
            <div className="col fw-bold">
              {props.contact.student.phone_number}
            </div>
          </div>
          <form action="" onSubmit={handleSubmit(updateStudentInfo)}>
            <section className="mt-3">
              <h5>Contact Information</h5>

              <div className="row">
                <div className="col-lg-6">
                  <Input
                    name="country"
                    label="Country"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    name="state"
                    label="State"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    name="local_govt"
                    label="Local Gov"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <Input
                    name="home_address"
                    label="Home Address"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-12">
                  <Input
                    name="contact_address"
                    label="Contact Address"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
            </section>
            <section>
              <h5>Next of Kin Information</h5>
              <Input
                name="full_name"
                label="Full name"
                register={register}
                errors={errors}
              />
              <div className="row">
                <div className="col-lg-6">
                  <Input
                    name="phone_number"
                    label="Phone number"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    name="email"
                    label="Email address"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-6">
                  <Input
                    name="relationship"
                    label="Relationship"
                    register={register}
                    errors={errors}
                  />
                </div>
                <div className="col-lg-12">
                  <Input
                    name="address"
                    label="Next of Kin Address"
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
            </section>
            <div className="d-flex">
              <SubmitButton title="Update Info" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default StudentInfo;
export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const contactInfo = await axios.get(
      `${process.env.API_BASE_URL}/students/contacts/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    const originInfo = await axios.get(
      `${process.env.API_BASE_URL}/students/origins/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    const kinInfo = await axios.get(
      `${process.env.API_BASE_URL}/students/kins/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    console.log(contactInfo);
    return {
      props: {
        contact: contactInfo.data,
        origin: originInfo.data,
        kin: kinInfo.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

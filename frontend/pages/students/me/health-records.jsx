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
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUI } from '../../../hooks/use-ui';

const HealthInfo = (props) => {
  const auth = useAuth();
  const ui = useUI();
  const router = useRouter();
  const [cookie, setCookie] = useCookies(['jwt']);

  const defaultValues = {
    health_status: '',
    blood_group: '',
    disability: '',
    medication: '',
  };

  useEffect(() => {
    reset(props.health);
  }, []);

  const profileSchema = yup.object().shape({
    health_status: yup.string(),
    blood_group: yup.string(),
    disability: yup.string(),
    medication: yup.string(),
  });

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(profileSchema),
  });

  const updateHealthHandler = async (data) => {
    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/students/health-records/me/`,
        data,
        { headers: { Authorization: cookie.jwt } }
      );
      console.log(res);
      //   router.reload();
      ui.setAlertMessage('Fields updated successfully', 'success');
      reset(res.data);
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
    console.log(data);
  };
  return (
    <div className="container">
      <PageHeader
        title="Student Health Info"
        description={`${auth.user.first_name} ${auth.user.middle_name} ${auth.user.last_name}`}
      />
      <section className="">
        <div className="row">
          <div className="col-lg-7">
            <form onSubmit={handleSubmit(updateHealthHandler)}>
              <h5>Student Health Information</h5>
              <div className="container bg-light">
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Full name</div>
                  <div className="col fw-bold">{`${props.health.student.first_name} ${props.health.student.last_name}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Reg Number</div>
                  <div className="col fw-bold">
                    {props.health.student.reg_number}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Phone Number</div>
                  <div className="col fw-bold">
                    {props.health.student.phone_number}
                  </div>
                </div>
              </div>
              <Select
                label="Health Status"
                name="health_status"
                register={register}
                errors={errors}
              >
                <option value="">---------</option>
                <option value="Healthy">Healthy</option>
                <option value="Unhealthy">Unhealthy</option>
                <option value="Injured">Injured</option>
              </Select>
              <Select
                name="blood_group"
                label="Blood Group"
                register={register}
                errors={errors}
              >
                <option value="">---------</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
              <Select
                name="disability"
                label="Disability?"
                register={register}
                errors={errors}
              >
                <option value="">---------</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Select>
              <Input
                name="medication"
                label="Medication?"
                register={register}
                errors={errors}
              />
              <div className="d-flex justify-content-end">
                <SubmitButton title="Update Health Info" />
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HealthInfo;
export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const healthInfo = await axios.get(
      `${process.env.API_BASE_URL}/students/health-records/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        health: healthInfo.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

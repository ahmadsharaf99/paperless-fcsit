import axios from 'axios';
import PageHeader from '../../../components/layout/page-title';
import { parseCookies } from '../../../utils/cookie';
import { useAuth } from '../../../auth/hooks/use-auth';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import SubmitButton from '../../../components/form-controls/submit-button';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../hooks/use-ui';

const SMS = (props) => {
  const router = useRouter();
  const { studentId } = router.query;

  const auth = useAuth();
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);

  const smsSchema = yup.object().shape({
    content: yup.string().required(),
  });
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { content: '' },
    resolver: yupResolver(smsSchema),
  });

  const sendSMSHandler = async (data) => {
    console.log('Sms Data', { content: data.content, student: studentId });
    try {
      const res = await axios.post(
        `${process.env.API_BASE_URL}/students/send-sms/`,
        { content: data.content, student: studentId },
        { headers: { Authorization: cookie.jwt } }
      );
      reset({ content: '' });
      ui.setAlertMessage('Message sent', 'success');
    } catch (err) {
      console.log(err.response.data);
      ui.setAlertMessage(err.response.statusText, 'error');
    }
  };

  return (
    <div className="container">
      <section className="">
        <div className="row">
          <div className="col-lg-7">
            <PageHeader
              title="Send SMS"
              description={`${props.student.first_name} ${props.student.middle_name} ${props.student.last_name}`}
            />
            <h5>Send SMS</h5>
            <div className="container">
              <form action="" onSubmit={handleSubmit(sendSMSHandler)}>
                <div className="py-1">
                  <label htmlFor="" className={`form-label fw-bold`}>
                    Content:
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Message content here"
                    name="content"
                    {...register('content')}
                    rows={8}
                  ></textarea>
                </div>
                <div className="d-flex justify-content-end">
                  <SubmitButton title="Send SMS" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default SMS;
export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  const { studentId } = context.params;
  try {
    const getStudent = await axios.get(
      `${process.env.API_BASE_URL}/students/auth/${studentId}`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        student: getStudent.data,
      },
    };
  } catch (err) {
    console.log(err.response);
    return {
      redirect: {
        destination: '/students',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
}

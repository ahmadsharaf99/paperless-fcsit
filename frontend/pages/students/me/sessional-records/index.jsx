import Link from 'next/link';
import PageHeader from '../../../../components/layout/page-title';
import { parseCookies } from '../../../../utils/cookie';
import axios from 'axios';
import { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../../../../components/form-controls/input';
import SubmitButton from '../../../../components/form-controls/submit-button';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../../hooks/use-ui';
import { useRouter } from 'next/router';
const defaultValues = {
  crf: '',
  ras: '',
  sif: '',
  spr: '',
  add_and_drop_crf: '',
};
const SessionalRecords = (props) => {
  const ui = useUI();
  const router = useRouter();
  const [sessions, setSessions] = useState(props.sessions ?? []);
  const [sessionalId, setSessionalId] = useState(props.sessions[0].id);
  const [cookie, setCookie] = useCookies(['jwt']);

  console.log(sessionalId);
  const sessionalRecordSchema = yup.object().shape({
    academic_session: yup.string(),
    crf: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * process.env.maxUploadSize; // 200kb max file size
        return true;
      })
      .test('fileType', 'Unsupported file type', (value) => {
        if (value)
          return ['image/jpeg', 'image/png', 'image/gif'].includes(
            value[0].type
          );
        return true;
      }),
    ras: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * process.env.maxUploadSize; // 200kb max file size
        return true;
      })
      .test('fileType', 'Unsupported file type', (value) => {
        if (value)
          return ['image/jpeg', 'image/png', 'image/gif'].includes(
            value[0].type
          );
        return true;
      }),
    sif: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * process.env.maxUploadSize; // 200kb max file size
        return true;
      })
      .test('fileType', 'Unsupported file type', (value) => {
        if (value)
          return ['image/jpeg', 'image/png', 'image/gif'].includes(
            value[0].type
          );
        return true;
      }),
    spr: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * process.env.maxUploadSize; // 200kb max file size
        return true;
      })
      .test('fileType', 'Unsupported file type', (value) => {
        if (value)
          return ['image/jpeg', 'image/png', 'image/gif'].includes(
            value[0].type
          );
        return true;
      }),
    add_and_drop_crf: yup
      .mixed()
      .test('fileSize', 'File larger than 200kb', (value) => {
        if (value) return value[0].size <= 1024 * process.env.maxUploadSize; // 200kb max file size
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
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(sessionalRecordSchema),
  });
  const updateSessionalRecordHandler = async (data) => {
    console.log(data);
    const formData = new FormData();
    formData.append('academic_session', data.academic_session);
    if (data.crf) formData.append('crf', data.crf[0]);
    if (data.ras) formData.append('ras', data.ras[0]);
    if (data.sif) formData.append('sif', data.sif[0]);
    if (data.spr) formData.append('spr', data.spr[0]);
    if (data.add_and_drop_crf)
      formData.append('add_and_drop_crf', data.add_and_drop_crf[0]);
    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/students/sessionals/${sessionalId}/`,
        formData,
        { headers: { Authorization: cookie.jwt } }
      );
      reset(defaultValues);
      ui.setAlertMessage('Sessional records updated successfully', 'success');
      router.reload();
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
    }
  };
  console.log(sessions);
  return (
    <div className="container">
      <PageHeader title="Sessional Records" />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-end">
            <Link
              href="/students/me/sessional-records/add-sessional-record"
              className="btn btn-primary"
            >
              Add Sessional Record
            </Link>
          </div>
          <Accordion defaultActiveKey="0" className="my-3">
            {sessions.map((session, index) => (
              <Accordion.Item
                eventKey={index}
                onClick={() => setSessionalId(session.id)}
              >
                {console.log('session', session.academic_session)}
                <form
                  action=""
                  onSubmit={handleSubmit(updateSessionalRecordHandler)}
                >
                  <input
                    type="hidden"
                    name="academic_session"
                    value={session.academic_session}
                    {...register('academic_session')}
                  />
                  <Accordion.Header>
                    {session.for_session.session}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Tabs
                      defaultActiveKey="crf"
                      id={session.for_session.session}
                      className="mb-3"
                    >
                      <Tab eventKey="crf" title="CRF">
                        <h5>Course Registration Form</h5>
                        <Image
                          src={
                            session.crf ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                        <div className="col-lg-5">
                          <Input
                            type="file"
                            name="crf"
                            label="Courses Reg Form (CRF)"
                            register={register}
                            errors={errors}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="sif" title="SIF">
                        <h5>Student Information Form</h5>
                        <Image
                          src={
                            session.sif ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                        <div className="col-lg-5">
                          <Input
                            type="file"
                            name="sif"
                            label="Student Info Form (SIF)"
                            register={register}
                            errors={errors}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="spr" title="SPR">
                        <h5>Student Payment Receipt</h5>
                        <Image
                          src={
                            session.spr ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                        <div className="col-lg-5">
                          <Input
                            type="file"
                            name="spr"
                            label="Student Payment Receipt (SPR)"
                            register={register}
                            errors={errors}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="ras" title="RAS">
                        <h5>Registration Ack Slip</h5>
                        <Image
                          src={
                            session.ras ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                        <div className="col-lg-5">
                          <Input
                            type="file"
                            name="ras"
                            label="Registration Ack Slip (RAS)"
                            register={register}
                            errors={errors}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="aad_crf" title="Add And Drop CRF">
                        <h5>Add And Drop CRF</h5>
                        <Image
                          src={
                            session.add_and_drop_crf ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                        <div className="col-lg-5">
                          <Input
                            type="file"
                            name="add_and_drop_crf"
                            label="Add And Drop CRF (Add & Drop CRF)"
                            register={register}
                            errors={errors}
                          />
                        </div>
                      </Tab>
                      <Tab eventKey="sessional_result" title="Sessional Result">
                        <h5>Sessional Result</h5>
                        <Image
                          src={
                            session.sessional_result ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                      </Tab>
                      <Tab
                        eventKey="studies_suspension"
                        title="Studies Suspension"
                      >
                        <h5>Studies Suspension</h5>
                        <Image
                          src={
                            session.studies_suspension ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                      </Tab>
                      <Tab eventKey="additional_doc_1" title="Additional Doc1">
                        <h5>Additional Doc1</h5>
                        <Image
                          src={
                            session.additional_doc_1 ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                      </Tab>
                      <Tab eventKey="additional_doc_2" title="Additional Doc2">
                        <h5>Additional Doc1</h5>
                        <Image
                          src={
                            session.additional_doc_2 ??
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }
                          alt=""
                          width={500}
                          height={500}
                        />
                      </Tab>
                    </Tabs>
                    <div className="d-flex">
                      <SubmitButton title="Update Sessional Record" />
                    </div>
                  </Accordion.Body>
                </form>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
export default SessionalRecords;

export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const sessionals = await axios.get(
      `${process.env.API_BASE_URL}/students/sessionals/`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        sessions: sessionals.data.results,
      },
    };
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

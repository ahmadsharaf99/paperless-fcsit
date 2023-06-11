import Link from 'next/link';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Accordion from 'react-bootstrap/Accordion';
import PageHeader from '../../../components/layout/page-title';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { parseCookies } from '../../../utils/cookie';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useUI } from '../../../hooks/use-ui';
import { useCookies } from 'react-cookie';
import Image from 'next/image';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Input from '../../../components/form-controls/input';
import SubmitButton from '../../../components/form-controls/submit-button';
import { useRouter } from 'next/router';

const Student = (props) => {
  const ui = useUI();
  const router = useRouter();
  const [cookie, setCookie] = useCookies(['jwt']);

  const [academicRecord, setAcademicRecord] = useState(null);
  const [profile, setProfile] = useState({});
  const [generalDocuments, setGeneralDocuments] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [contact, setContact] = useState(null);
  const [nextOfKin, setNextOfKin] = useState(null);
  const [health, setHealth] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const getRecords = async () => {
      ui.setLoading(true);
      try {
        const studentProfile = await axios.get(
          `${process.env.API_BASE_URL}/students/profile/${props.record_ids.stud_profile_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentContact = await axios.get(
          `${process.env.API_BASE_URL}/students/contacts/${props.record_ids.stud_contact_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentOrigin = await axios.get(
          `${process.env.API_BASE_URL}/students/origins/${props.record_ids.stud_origin_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentNextOfKin = await axios.get(
          `${process.env.API_BASE_URL}/students/kins/${props.record_ids.stud_kin_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentAcademicRecord = await axios.get(
          `${process.env.API_BASE_URL}/students/academic-records/${props.record_ids.acad_record_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentHealth = await axios.get(
          `${process.env.API_BASE_URL}/students/health-records/${props.record_ids.stud_health_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );
        const studentGeneralDocs = await axios.get(
          `${process.env.API_BASE_URL}/students/general-docs/${props.record_ids.stud_gen_docs_id}/`,
          { headers: { Authorization: cookie.jwt } }
        );

        console.log('record ids', props.record_ids);
        const sessionalRecords = [];
        await Promise.all(
          props.record_ids.stud_sessional_ids.map(async (sessional_id) => {
            try {
              const studentSessionRecords = await axios.get(
                `${process.env.API_BASE_URL}/students/sessionals/${sessional_id}/`,
                { headers: { Authorization: cookie.jwt } }
              );
              console.log('sessional data', studentSessionRecords.data);
              sessionalRecords.push(studentSessionRecords.data);
            } catch (err) {
              console.log('sessional record', err);
            }
          })
        );
        setSessions(sessionalRecords);

        setProfile(studentProfile.data);
        setContact(studentContact.data);
        setOrigin(studentOrigin.data);
        setNextOfKin(studentNextOfKin.data);
        setAcademicRecord(studentAcademicRecord.data);
        setHealth(studentHealth.data);
        setGeneralDocuments(studentGeneralDocs.data);
      } catch (err) {
        console.log(err);
      }
      ui.setLoading(false);
    };
    getRecords();
  }, []);

  const defaultValues = {
    // sessionId: '',
    sessional_result: '',
    studies_suspension: '',
    additional_doc_1: '',
    additional_doc_2: '',
  };
  const sessionalRecordSchema = yup.object().shape({
    sessional_result: yup
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
    studies_suspension: yup
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
    additional_doc_1: yup
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
    additional_doc_2: yup
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
    setError,
    register,
    formState: { errors },
  } = useForm({ defaultValues, resolver: yupResolver(sessionalRecordSchema) });

  const updateSessionalRecordHandler = async (data) => {
    console.log(data);
    const formData = new FormData();

    formData.append('academic_session', data.academic_session);
    if (data.sessional_result)
      formData.append('sessional_result', data.sessional_result[0]);
    if (data.studies_suspension)
      formData.append('studies_suspension', data.studies_suspension[0]);
    if (data.additional_doc_1)
      formData.append('additional_doc_1', data.additional_doc_1[0]);
    if (data.additional_doc_2)
      formData.append('additional_doc_2', data.additional_doc_2[0]);
    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/students/sessionals/${data.sessionId}/`,
        formData,
        { headers: { Authorization: cookie.jwt } }
      );
      console.log(res);
      reset(defaultValues);
      ui.setAlertMessage('Sessional records updated successfully', 'success');
      router.reload();
    } catch (err) {
      console.log(err);
      console.log(err.response.data);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center">
        <PageHeader title="Student Record" />
        <div>
          <Link href={`/students`} className="btn btn-warning me-2 ">
            <ArrowBackIcon /> Students
          </Link>
        </div>
      </div>

      <section>
        <div className="container">
          <Accordion defaultActiveKey="0">
            <Accordion.Item class eventKey="0">
              <Accordion.Header className="fw-bold">
                Student Info
              </Accordion.Header>
              <Accordion.Body>
                <div className="container">
                  <div className="d-flex flex-column align-items-end justify-content-end">
                    <Image
                      src={
                        profile?.passport_photo
                          ? `${profile.passport_photo}`
                          : `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                      }
                      width={150}
                      height={150}
                      alt=""
                    />
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Full name</div>
                    <div className="col fw-bold">{`${profile.student?.first_name} ${profile.student?.last_name}`}</div>
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Reg Number</div>
                    <div className="col fw-bold">
                      {profile.student?.reg_number}
                    </div>
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Phone Number</div>
                    <div className="col fw-bold">
                      {profile.student?.phone_number}
                    </div>
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Contact address</div>
                    <div className="col fw-bold">
                      {contact?.contact_address || 'Not yet provided'}
                    </div>
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Home address</div>
                    <div className="col fw-bold">
                      {contact?.home_address || 'Not yet provided'}
                    </div>
                  </div>
                  <div className="row border-bottom p-2">
                    <div className="col-4 border-end">Origin</div>
                    <div className="col fw-bold">
                      {origin &&
                        `${origin.local_govt || ''}, ${origin.state || ''}, ${
                          origin.country || ''
                        }`}
                    </div>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item class eventKey="1">
              <Accordion.Header className="fw-bold">
                Next of Kin Info
              </Accordion.Header>
              <Accordion.Body>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Full name</div>
                  <div className="col fw-bold">{`${nextOfKin?.full_name} ${profile.student?.last_name}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Relationship</div>
                  <div className="col fw-bold">{`${nextOfKin?.relationship}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Phone</div>
                  <div className="col fw-bold">{`${
                    nextOfKin?.phone_number || ''
                  }`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Email</div>
                  <div className="col fw-bold">{`${nextOfKin?.email}`}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Address</div>
                  <div className="col fw-bold">{`${nextOfKin?.address}`}</div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item class eventKey="2">
              <Accordion.Header className="fw-bold">
                Academic Record
              </Accordion.Header>
              <Accordion.Body>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Current Level</div>
                  <div className="col fw-bold">
                    {academicRecord?.current_level}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Mode Of Entry</div>
                  <div className="col fw-bold">
                    {academicRecord?.mode_entry}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Mode Of Study</div>
                  <div className="col fw-bold">
                    {academicRecord?.mode_study}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Entry Status</div>
                  <div className="col fw-bold">
                    {academicRecord?.entry_status}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Faculty</div>
                  <div className="col fw-bold">
                    {academicRecord?.faculty?.faculty_name}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Department</div>
                  <div className="col fw-bold">
                    {academicRecord?.department?.dept_name}
                  </div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Programme</div>
                  <div className="col fw-bold">
                    {academicRecord?.programme?.prog_name}
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item class eventKey="3">
              <Accordion.Header className="fw-bold">
                Health Record
              </Accordion.Header>
              <Accordion.Body>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Blood Group</div>
                  <div className="col fw-bold">{health?.blood_group}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Disability</div>
                  <div className="col fw-bold">{health?.disability}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Health Status</div>
                  <div className="col fw-bold">{health?.health_status}</div>
                </div>
                <div className="row border-bottom p-2">
                  <div className="col-4 border-end">Medication</div>
                  <div className="col fw-bold">{health?.medication}</div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item class eventKey="4">
              <Accordion.Header className="fw-bold">
                General Documents
              </Accordion.Header>
              <Accordion.Body>
                <Tabs
                  defaultActiveKey="admission"
                  id="uncontrolled-tab-example"
                  className="mb-3"
                >
                  <Tab eventKey="admission" title="Admission Letter">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>School Admission Letter</h6>
                        <Image
                          src={`${
                            generalDocuments?.school_adm_letter ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="jamb" title="Jamb Admission">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>Jamb Admission Letter</h6>
                        <Image
                          src={`${
                            generalDocuments?.jamb_adm_cert ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="oLevel" title="O Level Cert">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>O Level Cert</h6>
                        <Image
                          src={`${
                            generalDocuments?.o_level ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="primary" title="Primary Cert">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>Primary Cert</h6>
                        <Image
                          src={`${
                            generalDocuments?.pri_cert ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="testimonial" title="School Testimonial">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>School Testimonial</h6>
                        <Image
                          src={`${
                            generalDocuments?.sch_testimonial ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="medical" title="Medical Fitness">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>Medical Fitness</h6>
                        <Image
                          src={`${
                            generalDocuments?.medical_fitness ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="birthCert" title="Birth Cert">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>Birth Cert</h6>
                        <Image
                          src={`${
                            generalDocuments?.birth_cert ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab eventKey="lg" title="LG Cert">
                    <div className="row">
                      <div className="col-lg-6">
                        <h6>LGA Cert</h6>
                        <Image
                          src={`${
                            generalDocuments?.lg_cert ||
                            `${process.env.API_BASE_URL}/media/Image-Gallery-SVG.png`
                          }`}
                          alt=""
                          width={500}
                          height={500}
                          className="w-100"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item class eventKey="5">
              <Accordion.Header className="fw-bold">
                Sessional Records
              </Accordion.Header>
              <Accordion.Body>
                <Accordion defaultActiveKey="0" className="my-3">
                  {sessions.map((session, index) => (
                    <Accordion.Item class eventKey={index} key={index}>
                      {console.log('session', session.id)}
                      <Accordion.Header className="fw-bold">
                        {session.for_session.session}
                      </Accordion.Header>
                      <Accordion.Body>
                        <form
                          action=""
                          onSubmit={handleSubmit(updateSessionalRecordHandler)}
                        >
                          <input
                            type="hidden"
                            name="sessionId"
                            {...register('sessionId')}
                            value={session.id}
                          />
                          <input
                            type="hidden"
                            name="academic_session"
                            {...register('academic_session')}
                            value={session.academic_session}
                          />

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
                            </Tab>
                            <Tab
                              eventKey="sessional_result"
                              title="Sessional Result"
                            >
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
                              <div className="col-lg-5">
                                <Input
                                  type="file"
                                  name="sessional_result"
                                  label="Sessional Result"
                                  register={register}
                                  errors={errors}
                                />
                              </div>
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
                              <div className="col-lg-5">
                                <Input
                                  type="file"
                                  name="studies_suspension"
                                  label="Studies suspension"
                                  register={register}
                                  errors={errors}
                                />
                              </div>
                            </Tab>
                            <Tab
                              eventKey="additional_doc_1"
                              title="Additional Doc1"
                            >
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
                              <div className="col-lg-5">
                                <Input
                                  type="file"
                                  name="additional_doc_1"
                                  label="Additional Doc 1"
                                  register={register}
                                  errors={errors}
                                />
                              </div>
                            </Tab>
                            <Tab
                              eventKey="additional_doc_2"
                              title="Additional Doc2"
                            >
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
                              <div className="col-lg-5">
                                <Input
                                  type="file"
                                  name="additional_doc_2"
                                  label="Additional Doc 2"
                                  register={register}
                                  errors={errors}
                                />
                              </div>
                            </Tab>
                          </Tabs>
                          <div className="d-flex justify-content-end">
                            <SubmitButton title="Update record" />
                          </div>
                        </form>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </section>
    </div>
  );
};
export default Student;

export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  const { studentId } = context.params;

  console.log(studentId);
  try {
    const getInfoIds = await axios.get(
      `${process.env.API_BASE_URL}/core/get-info-ids/${studentId}`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        record_ids: getInfoIds.data,
      },
    };
    console.log(getInfoIds.data);
  } catch (err) {
    console.log(err.message);
  }
  return {
    props: {},
  };
}

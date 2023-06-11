import Image from 'next/image';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import PageHeader from '../../../components/layout/page-title';
import { useEffect, useState } from 'react';
import { useUI } from '../../../hooks/use-ui';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { parseCookies } from '../../../utils/cookie';
import Input from '../../../components/form-controls/input';
import SubmitButton from '../../../components/form-controls/submit-button';

const defaultValues = {
  school_adm_letter: '',
  jamb_adm_cert: '',
  o_level: '',
  pri_cert: '',
  sch_testimonial: '',
  medical_fitness: '',
  birth_cert: '',
  lg_cert: '',
};
const GeneralDocs = (props) => {
  const ui = useUI();
  const [cookie, setCookie] = useCookies(['jwt']);
  const [documents, setDocuments] = useState(props.documents);
  const [key, setKey] = useState('admission');

  const generalSchema = yup.object().shape({
    school_adm_letter: yup
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
    jamb_adm_cert: yup
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
    o_level: yup
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
    pri_cert: yup
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
    sch_testimonial: yup
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
    medical_fitness: yup
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
    birth_cert: yup
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
    lg_cert: yup
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
    resolver: yupResolver(generalSchema),
  });

  const updateGeneralDocHandler = async (data) => {
    const formData = new FormData();
    if (data.school_adm_letter)
      formData.append('school_adm_letter', data.school_adm_letter[0]);
    if (data.jamb_adm_cert)
      formData.append('jamb_adm_cert', data.jamb_adm_cert[0]);
    if (data.o_level) formData.append('o_level', data.o_level[0]);
    if (data.pri_cert) formData.append('pri_cert', data.pri_cert[0]);
    if (data.sch_testimonial)
      formData.append('sch_testimonial', data.sch_testimonial[0]);
    if (data.medical_fitness)
      formData.append('medical_fitness', data.medical_fitness[0]);
    if (data.birth_cert) formData.append('birth_cert', data.birth_cert[0]);
    if (data.lg_cert) formData.append('lg_cert', data.lg_cert[0]);
    console.log(data);
    console.log(formData);
    try {
      const res = await axios.patch(
        `${process.env.API_BASE_URL}/students/general-docs/me/`,
        formData,
        { headers: { Authorization: cookie.jwt } }
      );
      setDocuments(res.data);
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
  };

  return (
    <div className="container">
      <PageHeader title="General Documents" />
      <form action="" onSubmit={handleSubmit(updateGeneralDocHandler)}>
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          <Tab eventKey="admission" title="Admission Letter">
            <div className="row">
              <div className="col-lg-6">
                <h6>School Admission Letter</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.school_adm_letter}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change School Admission Letter"
                  name="school_adm_letter"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="jamb" title="Jamb Admission">
            <div className="row">
              <div className="col-lg-6">
                <h6>Jamb Admission Letter</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.jamb_adm_cert}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change Jamb Admission Letter"
                  name="jamb_adm_cert"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="oLevel" title="O Level Cert">
            <div className="row">
              <div className="col-lg-6">
                <h6>O Level Cert</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.o_level}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change O Level Cert"
                  name="o_level"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="primary" title="Primary Cert">
            <div className="row">
              <div className="col-lg-6">
                <h6>Primary Cert</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.pri_cert}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change Primary Cert"
                  name="pri_cert"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="testimonial" title="School Testimonial">
            <div className="row">
              <div className="col-lg-6">
                <h6>School Testimonial</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.sch_testimonial}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change School Testimonial"
                  name="sch_testimonial"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="medical" title="Medical Fitness">
            <div className="row">
              <div className="col-lg-6">
                <h6>Medical Fitness</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.medical_fitness}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change Medical Fitness"
                  name="medical_fitness"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="birthCert" title="Birth Cert">
            <div className="row">
              <div className="col-lg-6">
                <h6>Birth Cert</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.birth_cert}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change Birth Cert"
                  name="birth_cert"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
          <Tab eventKey="lg" title="LG Cert">
            <div className="row">
              <div className="col-lg-6">
                <h6>LGA Cert</h6>
                <Image
                  src={`${process.env.API_BASE_URL}${documents.lg_cert}`}
                  alt=""
                  width={500}
                  height={500}
                  className="w-100"
                  style={{ objectFit: 'contain' }}
                />
                <Input
                  type="file"
                  label="Change LGA Cert"
                  name="lg_cert"
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          </Tab>
        </Tabs>

        <div className="d-flex justify-content-end">
          <SubmitButton title="Update record" />
        </div>
      </form>
    </div>
  );
};

export default GeneralDocs;

export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const res = await axios.get(
      `${process.env.API_BASE_URL}/students/general-docs/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        documents: res.data,
      },
    };
  } catch (err) {
    console.log(err);
  }

  return {
    props: {},
  };
}

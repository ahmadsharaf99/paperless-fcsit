import axios from 'axios';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import PageHeader from '../../../../components/layout/page-title';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Link from 'next/link';
import { yupResolver } from '@hookform/resolvers/yup';
import Select from '../../../../components/form-controls/select';
import Input from '../../../../components/form-controls/input';
import SubmitButton from '../../../../components/form-controls/submit-button';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useUI } from '../../../../hooks/use-ui';
const defaultValues = {
  academic_session: '',
  crf: null,
  ras: null,
  sif: null,
  spr: null,
  add_and_drop_crf: null,
};
const AddSessionalRecord = () => {
  const ui = useUI();
  const [sessions, setSessions] = useState([]);
  const [cookie, setCookie] = useCookies(['jwt']);
  const sessionalRecordSchema = yup.object().shape({
    academic_session: yup.string().required('Session is required'),
    crf: yup
      .mixed()
      .nullable()
      //   .test('isEmpty', 'File field is required', function (value) {
      //     return value !== null && value !== undefined && value !== '';
      //   })
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
      .required('SIF is required')
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
      .required('Student payment receipt is required')
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

  useEffect(() => {
    const getSessions = async () => {
      try {
        const res = await axios.get(
          `${process.env.API_BASE_URL}/administration/academic-session/`,
          { headers: { Authorization: cookie.jwt } }
        );
        setSessions(res.data.results);
      } catch (err) {
        console.log(err);
      }
    };
    getSessions();
  }, []);

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(sessionalRecordSchema),
  });
  const addSessionalRecordHandler = async (data) => {
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
      const res = await axios.post(
        `${process.env.API_BASE_URL}/students/sessionals/`,
        formData,
        { headers: { Authorization: cookie.jwt } }
      );
      reset(defaultValues);
      ui.setAlertMessage('Sessional records uploaded successfully', 'success');
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
      <PageHeader title="Add Sessional Record" />
      <div className="d-flex justify-content-end">
        <Link
          href="/students/me/sessional-records/"
          className="btn btn-warning"
        >
          <ArrowBackIcon /> Sessional Records
        </Link>
      </div>
      <div className="row">
        <div className="col-lg-7">
          <form action="" onSubmit={handleSubmit(addSessionalRecordHandler)}>
            <Select
              name="academic_session"
              label="Session"
              register={register}
              errors={errors}
            >
              <option value="">-----</option>
              {sessions.map((session, index) => (
                <option key={index} value={session.id}>
                  {session.session}
                </option>
              ))}
            </Select>
            <Input
              type="file"
              name="crf"
              label="Courses Reg Form (CRF)"
              register={register}
              errors={errors}
            />
            <Input
              type="file"
              name="sif"
              label="Student Info Form (SIF)"
              register={register}
              errors={errors}
            />
            <Input
              type="file"
              name="spr"
              label="Student Payment Receipt (SPR)"
              register={register}
              errors={errors}
            />
            <Input
              type="file"
              name="ras"
              label="Registration Ack Slip (RAS)"
              register={register}
              errors={errors}
              required={true}
            />
            <Input
              type="file"
              name="add_and_drop_crf"
              label="Add And Drop CRF (Add & Drop CRF)"
              register={register}
              errors={errors}
            />
            <div className="d-flex justify-content-end">
              <SubmitButton title="Upload Sessional Record" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AddSessionalRecord;

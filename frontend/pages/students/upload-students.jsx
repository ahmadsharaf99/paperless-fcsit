import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import PageHeader from '../../components/layout/page-title';
import Input from '../../components/form-controls/input';
import SubmitButton from '../../components/form-controls/submit-button';
import { useCookies } from 'react-cookie';

const UploadStudents = () => {
  const [cookie, setCookie] = useCookies(['jwt']);
  const schema = yup.object().shape({
    csv_file: yup
      .mixed()
      .required('A CSV file is required')
      .test('fileSize', 'File size is too large', (value) => {
        return value && value[0].size <= 1024 * 1024; // 1MB max file size
      })
      .test('fileType', 'Unsupported file type', (value) => {
        return (
          value &&
          ['text/csv', 'application/vnd.ms-excel'].includes(value[0].type)
        );
      }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const UploadStudentsHandler = async (data) => {
    console.log('Hello downloading');
    const formData = new FormData();
    formData.append('csv_file', data.csv_file[0]);
    console.log(data.csv_file[0]);
    console.log(formData);
    try {
      const response = await axios.post(
        `${process.env.API_BASE_URL}/administration/upload/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: cookie.jwt,
          },
        }
      );

      console.log('File uploaded:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error.response.data);
    }
  };

  return (
    <div className="container">
      <PageHeader title="Upload students" />
      <div className="row">
        <div className="col-lg-7">
          <form onSubmit={handleSubmit(UploadStudentsHandler)}>
            <div className="row">
              <div className="col-lg-8">
                <Input
                  type="file"
                  label="Upload students csv"
                  name="csv_file"
                  required={true}
                  errors={errors}
                  register={register}
                />
              </div>
            </div>
            {/* <input type="file" {...register('csvFile')} />
            {errors.csvFile && <span>{errors.csvFile.message}</span>} */}
            <div className="col-lg-5">
              <SubmitButton title="Upload students" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default UploadStudents;

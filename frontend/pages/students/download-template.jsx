import Link from 'next/link';
import PageHeader from '../../components/layout/page-title';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const StudentTemplate = () => {
  const [cookie, setCookie] = useCookies(['jwt']);
  const downloadHandler = async () => {
    console.log('clicked');
    try {
      const response = await axios({
        url: `${process.env.API_BASE_URL}/administration/download-csv`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `${cookie.jwt}` },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_upload_template.csv'); // replace 'file.csv' with your desired filename
      document.body.appendChild(link);
      link.click();

      //   const response = await axios.get(
      //     `${process.env.API_BASE_URL}/administration/download-csv`,
      //     { headers: { Authorization: `${cookie.jwt}` } }
      //   );

      console.log(response);
    } catch (err) {
      console.log(err.response);
    }
  };
  return (
    <div className="container">
      <PageHeader title="Download student template" />
      <button className="btn btn-primary mt-2 mb-1" onClick={downloadHandler}>
        Download CSV
      </button>
      <p>
        Please make sure to follow the template standard, to avoid inconsistency
      </p>
    </div>
  );
};
export default StudentTemplate;

import axios from 'axios';
import PageHeader from '../../../components/layout/page-title';
import { parseCookies } from '../../../utils/cookie';
import { useAuth } from '../../../auth/hooks/use-auth';

const AcademicInfo = (props) => {
  const auth = useAuth();
  return (
    <div className="container">
      <section className="">
        <div className="row">
          <div className="col-lg-7">
            <PageHeader
              title="Academic Information"
              description={`${auth.user.first_name} ${auth.user.middle_name} ${auth.user.last_name}`}
            />
            <h5>Student Academic Information</h5>
            <div className="container bg-light">
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Current Level</div>
                <div className="col fw-bold">
                  {props.academicInfo.current_level}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Mode Of Entry</div>
                <div className="col fw-bold">
                  {props.academicInfo.mode_entry}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Mode Of Study</div>
                <div className="col fw-bold">
                  {props.academicInfo.mode_study}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Entry Status</div>
                <div className="col fw-bold">
                  {props.academicInfo.entry_status}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Faculty</div>
                <div className="col fw-bold">
                  {props.academicInfo.faculty.faculty_name}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Department</div>
                <div className="col fw-bold">
                  {props.academicInfo.department.dept_name}
                </div>
              </div>
              <div className="row border-bottom p-2">
                <div className="col-4 border-end">Programme</div>
                <div className="col fw-bold">
                  {props.academicInfo.programme.prog_name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default AcademicInfo;
export async function getServerSideProps(context) {
  const cookie = parseCookies(context.req);
  try {
    const getAcademicInfo = await axios.get(
      `${process.env.API_BASE_URL}/students/academic-records/me/`,
      { headers: { Authorization: cookie.jwt } }
    );
    return {
      props: {
        academicInfo: getAcademicInfo.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
  return {
    props: {},
  };
}

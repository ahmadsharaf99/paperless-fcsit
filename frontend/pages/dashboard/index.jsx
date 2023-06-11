import axios from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../auth/hooks/use-auth';
import PageHeader from '../../components/layout/page-title';
import { useUI } from '../../hooks/use-ui';
import { parseCookies } from '../../utils/cookie';
import { getUser, isAuthorized } from '../../utils/server-checks';

const Dashboard = () => {
  const auth = useAuth();
  const ui = useUI();

  const [cookie, setCookie] = useCookies(['jwt']);
  const [dashboardItems, setDashboardItems] = useState([]);

  const colors = ['danger', 'success', 'secondary', 'warning'];

  useEffect(() => {
    const initDashboard = async () => {
      ui.setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.API_BASE_URL}/core/dashboard/`,
          { headers: { Authorization: cookie.jwt } }
        );
        // setDashboardItems(response.data);
        const items = response.data;
        console.log(items);
        const dashItems = Object.keys(items).map((item) => {
          const label = String(item)
            .split('_')
            .map((word) => {
              word = String(word).split('');
              word[0] = String(word[0]).toUpperCase();
              return word.join('');
            })
            .join(' ');
          return { label, value: String(items[item]) };
        });
        setDashboardItems(dashItems);
        console.log(dashItems);
      } catch (err) {
        console.log(err.response.data);
      }
      ui.setLoading(false);
    };
    initDashboard();
  }, []);
  return (
    <div className="container">
      <PageHeader title={`${auth.user.role} Dashboard`} />
      <div className="row g-3">
        {dashboardItems.map((item, index) => (
          <div className="col-md-3">
            <div className="d-flex flex-column justify-content-between border p-3 rounded h-100">
              <h5>{item.label}</h5>
              <span
                className={`align-self-end mt-2 fw-bold px-3 py-1 fs-6 text-white rounded-5 bg-${
                  colors[Math.floor(Math.random() * colors.length)]
                }`}
              >
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
// export async function getServerSideProps(context) {
//   const cookie = parseCookies(context.req);

//   try {
//     const user = await getUser(cookie);
//     const redirectPath = isAuthorized(['ADMIN'], user, context);
//     if (redirectPath !== undefined) return redirectPath;
//   } catch (err) {
//     console.log(err);
//   }
//   return {
//     props: {},
//   };
// }

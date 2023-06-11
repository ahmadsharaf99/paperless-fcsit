import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import PageHeader from '../../components/layout/page-title';
import { parseCookies } from '../../utils/cookie';
import { customStyles } from '../../utils/data-table';
import debounce from 'lodash.debounce';
import { useCookies } from 'react-cookie';

const Staff = (props) => {
  const [staff, setStaff] = useState(props.staff ?? []);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(staff);

  const handleSearch = debounce(async (e) => {
    const staffRes = await axios.get(
      `${process.env.API_BASE_URL}/staff/auth/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(staffRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(staff);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Username', cell: (row) => row.username, sortable: true },
    { name: 'Email', cell: (row) => row.email },
    {
      name: 'Full name',
      cell: (row) =>
        `${row.first_name} ${row.middle_name || ''} ${row.last_name}`,
      sortable: true,
    },
    { name: 'Phone', cell: (row) => row.phone_number },
    {
      name: 'Action',
      cell: (row) => (
        <>
          <Link href={`/staff/${row.id}/assign`} className="btn btn-secondary">
            Assign
          </Link>
        </>
      ),
    },
  ];
  return (
    <div className="container">
      <PageHeader title="Level Cord List" />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search staff"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded border w-100"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-end">
            <Link href="/staff/add-staff" className="btn btn-primary">
              Add Staff
            </Link>
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={searchResult}
        pagination
        paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
        // subHeader
        // subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
        customStyles={customStyles}
      />
    </div>
  );
};

export default Staff;

export async function getServerSideProps(context) {
  try {
    const cookie = parseCookies(context.req);
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });
    console.log(userRes.data.data);

    if (!['ADMIN'].includes(userRes.data.data.role)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const staffRes = await axios.get(`${process.env.API_BASE_URL}/staff/auth`, {
      headers: { Authorization: `${cookie.jwt}` },
    });

    return {
      props: {
        staff: staffRes.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import debounce from 'lodash.debounce';

import FilterComponent from '../../components/filter-component';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmsIcon from '@mui/icons-material/Sms';

import PageHeader from '../../components/layout/page-title';
import { parseCookies } from '../../utils/cookie';
import { customStyles } from '../../utils/data-table';
import { useCookies } from 'react-cookie';

const Students = (props) => {
  const [students, setStudents] = useState(props.students ?? []);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(students);

  const handleSearch = debounce(async (e) => {
    const studentsRes = await axios.get(
      `${process.env.API_BASE_URL}/students/auth/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(studentsRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(students);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Reg No', cell: (row) => row.reg_number, sortable: true },
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
          <Link
            href={`/students/${row.id}`}
            className="btn btn-light me-2"
            title="View student info"
          >
            <VisibilityIcon />
          </Link>
          <Link
            href={`/students/${row.id}/sms`}
            className="btn btn-outline-secondary me-2"
            title="Send SMS"
          >
            <SmsIcon />
          </Link>
        </>
      ),
    },
  ];
  return (
    <div className="container">
      <PageHeader title="Students List" />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search students"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded border w-100"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-end">
            <Link href="/students/add-student" className="btn btn-primary">
              Add Student
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

export default Students;

export async function getServerSideProps(context) {
  try {
    const cookie = parseCookies(context.req);
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });

    if (!['ADMIN', 'LEVEL_CORD'].includes(userRes.data.data.role)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const studentsRes = await axios.get(
      `${process.env.API_BASE_URL}/students/auth`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        students: studentsRes.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

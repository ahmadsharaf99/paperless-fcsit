import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import debounce from 'lodash.debounce';
import { useCookies } from 'react-cookie';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import PageHeader from '../../../components/layout/page-title';
import { parseCookies } from '../../../utils/cookie';
import { customStyles } from '../../../utils/data-table';

const Departments = (props) => {
  const router = useRouter();
  const { facultyId } = router.query;

  const [departments, setDepartments] = useState(props.departments ?? []);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(departments);

  const handleSearch = debounce(async (e) => {
    const facultiesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}/departments/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(facultiesRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(departments);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Department name', cell: (row) => row.dept_name, sortable: true },
    { name: 'Department code', cell: (row) => row.dept_code },

    { name: 'Established date', cell: (row) => row.established_date },
    {
      name: 'Action',
      cell: (row) => (
        <>
          <Link
            href={`/faculties/${facultyId}/departments/${row.id}/programmes`}
            className="btn btn-light me-2"
            title="View programmes"
          >
            <VisibilityIcon />
          </Link>
          <Link
            href={`/faculties/${facultyId}/departments/${row.id}/add-programme`}
            className="btn btn-secondary"
            title="Add programme"
          >
            <AddIcon />
          </Link>
        </>
      ),
    },
  ];
  return (
    <div className="container">
      <PageHeader
        title="Departments"
        description={`Faculty ${props.faculty.faculty_name}`}
      />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search departments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded border w-100"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-end">
            <Link href={`/faculties`} className="btn btn-warning me-2 ">
              <ArrowBackIcon /> Faculties
            </Link>
            <Link
              href={`/faculties/${facultyId}/add-department`}
              className="btn btn-primary"
            >
              Add Department
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

export default Departments;

export async function getServerSideProps(context) {
  const { facultyId } = context.params;
  try {
    const cookie = parseCookies(context.req);
    const userRes = await axios.get(`${process.env.API_BASE_URL}/core/me`, {
      headers: { Authorization: `${cookie.jwt}` },
    });

    if (!['ADMIN'].includes(userRes.data.data.role)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const facultyRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );

    console.log(facultyRes.data);

    const departmentsRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/${facultyId}/departments/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        departments: departmentsRes.data.results,
        faculty: facultyRes.data,
      },
    };
  } catch (err) {
    console.log(err.message);
    return {
      redirect: {
        destination: '/faculties',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

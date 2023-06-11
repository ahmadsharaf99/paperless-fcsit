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

import PageHeader from '../../../../../components/layout/page-title';
import { customStyles } from '../../../../../utils/data-table';
import { parseCookies } from '../../../../../utils/cookie';

const Programmes = (props) => {
  const router = useRouter();
  const { facultyId, departmentId } = router.query;

  const [programmes, setProgrammes] = useState(props.programmes ?? []);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(programmes);

  const handleSearch = debounce(async (e) => {
    const programmesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/programmes/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(programmesRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(programmes);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Programme name', cell: (row) => row.prog_name, sortable: true },
    { name: 'Duration', cell: (row) => row.prog_duration },

    { name: 'Established date', cell: (row) => row.established_date },
    // {
    //   name: 'Action',
    //   cell: (row) => (
    //     <>
    //       <Link
    //         href={`/faculties/${row.id}/departments`}
    //         className="btn btn-light me-2"
    //         title="View programmes"
    //       >
    //         <VisibilityIcon />
    //       </Link>
    //       <Link
    //         href={`/faculties/${facultyId}/departments/${departmentId}/add-programme`}
    //         className="btn btn-secondary"
    //         title="Add programme"
    //       >
    //         <AddIcon />
    //       </Link>
    //     </>
    //   ),
    // },
  ];
  return (
    <div className="container">
      <PageHeader
        title={`Programmes`}
        description={`Department ${props.department.dept_name}`}
      />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search programmes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded border w-100"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-end">
            <Link
              href={`/faculties/${facultyId}/departments`}
              className="btn btn-warning me-2 "
            >
              <ArrowBackIcon /> Departments
            </Link>
            <Link
              href={`/faculties/${facultyId}/departments/${departmentId}/add-programme`}
              className="btn btn-primary "
            >
              Add Programme
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

export default Programmes;

export async function getServerSideProps(context) {
  const { facultyId, departmentId } = context.params;
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

    const departmentRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );

    console.log(departmentRes.data);

    const programmesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/departments/${departmentId}/programmes/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        department: departmentRes.data,
        programmes: programmesRes.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
    return {
      redirect: {
        destination: `/faculties/${facultyId}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

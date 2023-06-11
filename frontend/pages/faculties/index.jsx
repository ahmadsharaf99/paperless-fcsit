import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import FilterComponent from '../../components/filter-component';
import PageHeader from '../../components/layout/page-title';
import { parseCookies } from '../../utils/cookie';
import { customStyles } from '../../utils/data-table';
import { useCookies } from 'react-cookie';
import debounce from 'lodash.debounce';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';

const Faculties = (props) => {
  const [faculties, setFaculties] = useState(props.faculties ?? []);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(faculties);

  const handleSearch = debounce(async (e) => {
    const facultiesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(facultiesRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(faculties);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Faculty name', cell: (row) => row.faculty_name, sortable: true },
    { name: 'Faculty code', cell: (row) => row.faculty_code },

    { name: 'Established date', cell: (row) => row.established_date },
    {
      name: 'Action',
      cell: (row) => (
        <>
          <Link
            href={`/faculties/${row.id}/departments`}
            className="btn btn-light me-2"
            title="View department"
          >
            <VisibilityIcon />
          </Link>
          <Link
            href={`/faculties/${row.id}/add-department`}
            className="btn btn-secondary"
            title="Add department"
          >
            <AddIcon />
          </Link>
        </>
      ),
    },
  ];
  return (
    <div className="container">
      <PageHeader title="Faculty List" />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search faculties"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 rounded border w-100"
              style={{ outline: 'none' }}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="d-flex justify-content-end">
            <Link href="/faculties/add-faculty" className="btn btn-primary">
              Add Faculty
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

export default Faculties;

export async function getServerSideProps(context) {
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

    const facultiesRes = await axios.get(
      `${process.env.API_BASE_URL}/divisions/faculties/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        faculties: facultiesRes.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

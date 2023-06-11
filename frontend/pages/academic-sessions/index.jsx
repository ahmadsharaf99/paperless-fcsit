import axios from 'axios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import debounce from 'lodash.debounce';

import FilterComponent from '../../components/filter-component';
import PageHeader from '../../components/layout/page-title';
import { parseCookies } from '../../utils/cookie';
import { customStyles } from '../../utils/data-table';
import { useCookies } from 'react-cookie';

const AcademicSession = (props) => {
  const [academicSessions, setAcademicSessions] = useState(
    props.academicSessions ?? []
  );
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [cookie, setCookie] = useCookies(['jwt']);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(academicSessions);

  const handleSearch = debounce(async (e) => {
    const academicSessionsRes = await axios.get(
      `${process.env.API_BASE_URL}/administration/academic-session/?search=${searchTerm}`,
      { headers: { Authorization: `${cookie.jwt}` } }
    );
    setSearchResult(academicSessionsRes.data.results);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setSearchResult(academicSessions);
    }
    return () => handleSearch.cancel();
  }, [searchTerm]);

  const columns = [
    { name: 'Session', cell: (row) => row.session, sortable: true },
    {
      name: 'Updated student levels?',
      cell: (row) => (row.is_update_student_levels ? 'True' : 'False'),
      sortable: true,
    },
    {
      name: 'Updated cord levels?',
      cell: (row) => (row.is_update_level_cord ? 'True' : 'False'),
      sortable: true,
    },
    {
      name: 'Has been updated',
      cell: (row) => (row.has_updated ? 'True' : 'False'),
    },
    {
      name: 'Action',
      cell: (row) => (
        <>
          <button className="btn btn-secondary" disabled={row.has_updated}>
            Update
          </button>
          <form action="">
            <input type="hidden" name="is_current_session" value={true} />
          </form>
        </>
      ),
    },
  ];
  return (
    <div className="container">
      <PageHeader title="Sessions" />
      <div className="row justify-content-between">
        <div className="col-lg-4">
          <div className="d-flex w-100">
            <input
              type="search"
              placeholder="Search sessions"
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
              href="/academic-sessions/add-session"
              className="btn btn-primary"
            >
              Add Session
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

export default AcademicSession;

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

    const academicSessions = await axios.get(
      `${process.env.API_BASE_URL}/administration/academic-session/`,
      {
        headers: { Authorization: `${cookie.jwt}` },
      }
    );

    return {
      props: {
        academicSessions: academicSessions.data.results,
      },
    };
  } catch (err) {
    console.log(err.message);
  }

  return {
    props: {},
  };
}

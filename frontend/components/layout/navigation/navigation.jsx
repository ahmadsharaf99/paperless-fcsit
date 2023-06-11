import { useAuth } from '../../../auth/hooks/use-auth';

const navigation = () => {
  const auth = useAuth();

  if (['ADMIN'].includes(auth.user.role)) {
    return [
      {
        label: 'Students',
        path: '/students',
        children: [
          { label: 'Add student', path: '/students/add-student' },
          { label: 'Student List', path: '/students/' },
          { label: 'Download template', path: '/students/download-template' },
          { label: 'Upload students', path: '/students/upload-students' },
        ],
      },
      {
        label: 'Level Coords',
        path: '/level-coord',
        children: [
          { label: 'Add level coord', path: '/staff/add-staff' },
          { label: 'Level Cord List', path: '/staff/' },
        ],
      },
      {
        label: 'Faculties',
        path: '/faculties',
        children: [
          { label: 'Add Faculty', path: '/faculties/add-faculty' },
          { label: 'Faculty List', path: '/faculties' },
        ],
      },
      {
        label: 'Academic sessions',
        path: '/academic-sessions/',
        children: [{ label: 'Session List', path: '/academic-sessions/' }],
      },
    ];
  } else if (['LEVEL_CORD'].includes(auth.user.role)) {
    return [
      {
        label: 'Students',
        path: '/students',
        children: [
          { label: 'Add Student', path: '/students/add-student' },
          { label: 'Students List', path: '/students/' },
        ],
      },
      {
        label: 'Profile',
        path: '/staff/me/profile',
      },
    ];
  } else if (['STUDENT'].includes(auth.user.role)) {
    return [
      {
        label: 'Records',
        path: '/students',
        children: [
          { label: 'General Documents', path: '/students/me/general-docs' },
          {
            label: 'Sessional Records',
            path: '/students/me/sessional-records',
          },
          { label: 'Health Records', path: '/students/me/health-records' },
          { label: 'Student Info', path: '/students/me/student-info' },
        ],
      },

      { label: 'Academic Info', path: '/students/me/academic-info' },
      {
        label: 'Profile',
        path: '/students/me/profile',
      },
    ];
  }

  return [];
};
export default navigation;

import CircularProgress from '@mui/material/CircularProgress';
const Spinner = () => {
  return (
    <div
      className="min-vh-100 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-opacity-75 bg-white position-fixed top-0 start-0"
      style={{ zIndex: '2000' }}
    >
      <CircularProgress />
    </div>
  );
};

export default Spinner;

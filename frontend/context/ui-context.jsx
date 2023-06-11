import { createContext, useState } from 'react';
import Spinner from '../components/ui/spinner';

const defaultValues = {
  loading: false,
  setLoading: (Boolean) => {},

  /* alert related default states  */
  showAlert: false,
  closeAlert: () => {},
  alertMessage: null,
  alertStatus: null,
  setAlertMessage: (message, status) => {},
  /* end of alert related default states  */
};

const UIContext = createContext(defaultValues);

export const UIContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(defaultValues.loading);

  /* alert related states and handlers */
  const [showAlert, setShowAlert] = useState(defaultValues.showAlert);
  const [alertMessage, setAlertMessage] = useState(defaultValues.alertMessage);
  const [alertStatus, setAlertStatus] = useState(defaultValues.alertStatus);

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage(null);
  };

  const setAlertMessageHandler = (message, status) => {
    setAlertMessage(message);
    setAlertStatus(status);
    setShowAlert(true);
  };
  /* end of alert related states and handlers */

  const values = {
    loading,
    setLoading,

    /* alert related states  */
    showAlert,
    closeAlert,
    alertMessage,
    alertStatus,
    setAlertMessage: setAlertMessageHandler,
    /* end of alert related states */
  };

  return (
    <UIContext.Provider value={values}>
      {loading && <Spinner />}
      {children}
    </UIContext.Provider>
  );
};

export default UIContext;

import Modal from 'react-bootstrap/Modal';
import { useUI } from '../../hooks/use-ui';

const Alert = () => {
  const ui = useUI();

  let headerClasses = 'border-0 ';
  if (ui.alertStatus == 'error') headerClasses += 'bg-danger';
  if (ui.alertStatus == 'success') headerClasses += 'bg-success';

  return (
    <Modal show={ui.showAlert} onHide={ui.closeAlert}>
      <Modal.Header className={headerClasses} closeButton></Modal.Header>
      <Modal.Body>
        <div className="text-center">
          {ui.alertStatus == 'error' && <h3 className="text-danger">Error</h3>}
          {ui.alertStatus == 'success' && (
            <h3 className="text-success">Success</h3>
          )}
        </div>
        <div className="p-2 text-center">{ui.alertMessage}</div>
      </Modal.Body>
    </Modal>
  );
};
export default Alert;

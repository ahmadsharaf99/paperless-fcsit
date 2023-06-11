import { useState } from 'react';
import axios from 'axios';

const useRequest = ({ url, method,  onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const sendRequest = async (body) => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      setErrors(err.response.data.errors);
    }
  };

  return { sendRequest, errors };
};

export default useRequest;

import { useState } from 'react';

export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    callback();
  };

  const onChangeImage = (e, callback) => {
    const uploader = e.target.files[0] || '';
    setValues({ ...values, [e.target.name]: uploader, [e.target.id]: uploader !== "" && uploader !== undefined ? URL.createObjectURL(uploader) : "" })
    callback({variables: {file: uploader}})
  }
  const reset = () => {
    setValues(initialState)
  }

  return {
    onChange,
    onSubmit,
    values,
    onChangeImage,
    reset
  };
};

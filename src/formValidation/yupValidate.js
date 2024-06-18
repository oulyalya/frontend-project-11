import { keyBy } from 'lodash';
import yupInit from './yupInit.js';

const yupValidate = (fields) => {
  const yupSchema = yupInit();

  const promise = yupSchema.validate(fields, { abortEarly: false })
    .then(() => ({}))
    .catch((error) => keyBy(error.inner, 'path'));
  return promise;
};

export default yupValidate;

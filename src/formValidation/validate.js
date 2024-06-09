import { keyBy } from 'lodash';
import schema from './schema.js';

const validate = (fields) => {
  const promise = schema.validate(fields, { abortEarly: false })
    .then(() => ({}))
    .catch((error) => keyBy(error.inner, 'path'));
  return promise;
};

export default validate;

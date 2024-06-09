import * as yup from 'yup';

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

export default schema;

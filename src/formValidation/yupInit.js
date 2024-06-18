import * as yup from 'yup';

const yupInit = () => {
  yup.setLocale({
    string: {
      url: 'invalidURL',
    },
    mixed: {
      required: 'requiredField',
    },
  });
  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });
  return schema;
};

export default yupInit;

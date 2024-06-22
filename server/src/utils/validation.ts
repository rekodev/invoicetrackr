export const transformErrors = (errors) => {
  return errors.map((err) => {
    return {
      key: err.instancePath.substring(1).replace(/\//g, '.'),
      value: err.message,
    };
  });
};

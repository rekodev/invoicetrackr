export const mapValidationErrors = (errors: Array<Record<string, string>>) => {
  if (!errors?.length) return {};

  return errors.reduce<Record<string, string>>((acc, error) => {
    acc[error.key] = error.value;
    return acc;
  }, {});
};

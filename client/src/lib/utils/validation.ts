export const mapValidationErrors = (errors: Array<Record<string, string>>) => {
  if (!errors?.length) return {};

  return errors.reduce(
    (acc, error) => {
      acc[error.key] = error.value;
      return acc;
    },
    {} as Record<string, string>
  );
};

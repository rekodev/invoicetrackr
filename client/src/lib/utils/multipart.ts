/**
 * Converts a nested object to FormData for multipart/form-data requests
 * Handles nested objects, arrays, and File instances
 */
export const buildFormData = (
  data: Record<string, any>,
  formData = new FormData(),
  parentKey = ''
): FormData => {
  Object.entries(data).forEach(([key, value]) => {
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value instanceof File) {
      formData.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (
          typeof item === 'object' &&
          item !== null &&
          !(item instanceof File)
        ) {
          buildFormData(item, formData, `${formKey}[${index}]`);
        } else if (item !== undefined && item !== null) {
          formData.append(`${formKey}[${index}]`, String(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      buildFormData(value, formData, formKey);
    } else if (value !== undefined && value !== null) {
      formData.append(formKey, String(value));
    }
  });

  return formData;
};

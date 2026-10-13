export const containsPattern = (value: string) =>
  `%${value.replace(/[\\%_]/g, '\\$&')}%`;

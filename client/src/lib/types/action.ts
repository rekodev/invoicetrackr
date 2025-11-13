export type ActionResponseModel = {
  ok: boolean;
  message: string;
  validationErrors?: Record<string, string>;
};

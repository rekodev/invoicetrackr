import { Multipart, MultipartFields } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

// TODO: Improve this function because right now it only handles fields 3 layers deep
const parseNestedKey = (
  key: string,
  value: unknown,
  entity: Record<string, unknown> | Record<string, Array<unknown>>
) => {
  const keys = key.split(/\[|\]\[|\]/).filter(Boolean);

  if (keys.length === 1) {
    entity[key] = value;

    return;
  }

  if (keys.length === 2) {
    const parentKey = keys[0];
    const childKey = keys[1];
    let entityFieldObject = entity[`${parentKey}`];

    if (entityFieldObject) {
      entity[`${parentKey}`][`${childKey}`] = value;
    } else {
      entity[`${parentKey}`] = { [`${childKey}`]: value };
    }

    return;
  }

  if (keys.length === 3) {
    const parentKey = keys[0];
    const index = parseInt(keys[1]);
    const childKey = keys[2];

    if (!Array.isArray(entity[`${parentKey}`])) {
      entity[`${parentKey}`] = [];
    }

    const entityFieldArray = entity[`${parentKey}`] as Array<
      Record<string, unknown>
    >;

    while (entityFieldArray.length <= index) {
      entityFieldArray.push({});
    }

    entity[`${parentKey}`][index][`${childKey}`] = value;

    return;
  }
};

const buildEntityFromFormData = (
  fields: MultipartFields | Array<Multipart>
): Record<string, unknown> => {
  const entity: Record<string, unknown> = {};

  for (const key of Object.keys(fields)) {
    const field = fields[key];

    parseNestedKey(key, field.value, entity);
  }

  return entity;
};

export const preValidateFileAndFields = async (request: FastifyRequest) => {
  if (!request.isMultipart()) return;

  const file = await request.file();

  request.body = buildEntityFromFormData(file.fields);
  request.body['file'] = file;
};

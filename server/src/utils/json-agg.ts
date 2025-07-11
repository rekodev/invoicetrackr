import { AnyColumn, InferColumnsDataTypes, sql, SQL } from 'drizzle-orm';

export function jsonAgg<T extends Record<string, AnyColumn>>(select: T) {
  const chunks: SQL[] = [];

  Object.entries(select).forEach(([key, column], index) => {
    if (index > 0) chunks.push(sql`,`);
    chunks.push(sql.raw(`'${key}',`), sql`${column}`);
  });

  return sql<InferColumnsDataTypes<T>[]>`
    coalesce(
      json_agg(json_build_object(${sql.join(chunks)})),
      '[]'
    )
  `;
}

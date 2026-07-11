const sensitiveKeyPattern =
  /(password|token|signature|secureurl|storagekey|checksum|authorization|cookie)/i;

export const sanitizeAuditValue = (
  value: unknown,
  seen = new WeakSet<object>()
): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value))
    return value.map((item) => sanitizeAuditValue(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      sensitiveKeyPattern.test(key)
        ? '[REDACTED]'
        : sanitizeAuditValue(nestedValue, seen)
    ])
  );
};

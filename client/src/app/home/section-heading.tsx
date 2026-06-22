export default function SectionHeading({
  eyebrow,
  title,
  accent,
  body
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <div className="section-eyebrow text-muted">{eyebrow}</div>
      )}
      <h2 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
        {title}
        {accent && (
          <>
            <br />
            <span className="text-muted">{accent}</span>
          </>
        )}
      </h2>
      {body && (
        <p className="text-muted mt-4 text-sm leading-relaxed">{body}</p>
      )}
    </div>
  );
}

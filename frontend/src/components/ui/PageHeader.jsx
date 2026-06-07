export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 md:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  eyebrow?: string
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="label mb-2">{eyebrow}</p>}
        <h1 className="display text-[32px] leading-[1.04] text-ink sm:text-[38px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-[620px] text-[13px] leading-5 text-muted-ink">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
    </div>
  )
}

import { wasteCategories } from "@/lib/mockData"

export function CategoryChip({ categoryId, size = "sm" }: { categoryId: string; size?: "sm" | "xs" }) {
  const category = wasteCategories.find((item) => item.id === categoryId) ?? wasteCategories[0]
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-ink-2 ${size === "xs" ? "text-[11px]" : "text-[12px]"}`}
    >
      <span
        className="size-[7px] shrink-0 rounded-full"
        style={{ background: category.color }}
        aria-hidden
      />
      {category.name}
    </span>
  )
}

export function CategorySwatch({ categoryId, className = "" }: { categoryId: string; className?: string }) {
  const category = wasteCategories.find((item) => item.id === categoryId) ?? wasteCategories[0]
  return (
    <span
      className={`inline-block size-[7px] shrink-0 rounded-full ${className}`}
      style={{ background: category.color }}
      aria-hidden
    />
  )
}

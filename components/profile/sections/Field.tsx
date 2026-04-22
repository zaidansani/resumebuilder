export default function Field({ label, value, onChange, type = "text", disabled }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-40"
      />
    </label>
  )
}

"use client"

import { Identification } from "@/types/resume"

interface Props {
  value: Identification
  onChange: (value: Identification) => void
}

export default function IdentificationSection({ value, onChange }: Props) {
  function set<K extends keyof Identification>(key: K, val: Identification[K]) {
    onChange({ ...value, [key]: val })
  }

  const { personName, contact, headline } = value

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Title"
          value={personName.title ?? ""}
          onChange={(v) => set("personName", { ...personName, title: v || undefined })}
          placeholder="Dr., Prof."
        />
        <Field
          label="First name"
          value={personName.firstName}
          onChange={(v) => set("personName", { ...personName, firstName: v })}
        />
        <Field
          label="Surname"
          value={personName.surname}
          onChange={(v) => set("personName", { ...personName, surname: v })}
        />
      </div>

      <Field
        label="Headline"
        value={headline ?? ""}
        onChange={(v) => set("headline", v || undefined)}
        placeholder="Software Engineer"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Email"
          value={contact.email ?? ""}
          onChange={(v) =>
            set("contact", { ...contact, email: v || undefined })
          }
          type="email"
        />
        <Field
          label="Phone"
          value={contact.phone?.[0]?.number ?? ""}
          onChange={(v) =>
            set("contact", {
              ...contact,
              phone: v ? [{ type: "mobile", number: v }] : undefined,
            })
          }
          type="tel"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="City"
          value={contact.address?.municipality ?? ""}
          onChange={(v) =>
            set("contact", {
              ...contact,
              address: { ...contact.address, municipality: v || undefined },
            })
          }
        />
        <Field
          label="Country"
          value={contact.address?.country?.label ?? ""}
          onChange={(v) =>
            set("contact", {
              ...contact,
              address: {
                ...contact.address,
                country: v ? { label: v } : undefined,
              },
            })
          }
        />
      </div>

      <Field
        label="Website"
        value={contact.website?.[0]?.url ?? ""}
        onChange={(v) =>
          set("contact", {
            ...contact,
            website: v ? [{ url: v }] : undefined,
          })
        }
        type="url"
        placeholder="https://..."
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="GitHub"
          value={contact.github ?? ""}
          onChange={(v) => set("contact", { ...contact, github: v || undefined })}
          placeholder="username"
        />
        <Field
          label="LinkedIn"
          value={contact.linkedin ?? ""}
          onChange={(v) => set("contact", { ...contact, linkedin: v || undefined })}
          placeholder="username"
        />
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">About</span>
        <textarea
          value={value.about ?? ""}
          onChange={(e) => set("about", e.target.value || undefined)}
          placeholder="A short bio or summary..."
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50 resize-none"
        />
      </label>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground/50"
      />
    </label>
  )
}

// ── global template: default ──────────────────────────────────────────────────
// Sets page geometry, typography, and shared helpers.
// `data` and `render-section` are injected by the compiler harness.
// ─────────────────────────────────────────────────────────────────────────────

#set page(paper: "a4", margin: (x: 1cm, y: 1.2cm))
#set text(font: "Libertinus Serif", size: 10.5pt)
#set par(justify: true, leading: 0.4em)

#let section(title, body) = {
  v(-0.2em)
  text(weight: "bold", size: 12pt, upper(title))
  v(-0.2em)
  body
}

#let fmt-date(s) = {
  let months = ("Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec")
  let parts = s.split("-")
  if parts.len() >= 2 {
    let m = int(parts.at(1)) - 1
    let yy = parts.at(0).slice(2)
    months.at(m) + " " + yy
  } else {
    s
  }
}

#let period-str(p) = {
  let f = if p.from != "" { fmt-date(p.from) } else { "?" }
  let t = if p.at("current", default: false) {
    "present"
  } else if "to" in p and p.to != "" {
    fmt-date(p.to)
  } else {
    "?"
  }
  f + " – " + t
}

#let render-block(b) = {
  v(-0.4em)
  if b.heading != "" {
    text(weight: "semibold", size: 9.5pt)[#b.heading]
  }
  if b.type == "paragraph" [
    #b.body
  ] else if b.type == "bullets" {
    for item in b.items [- #item]
  } else if b.type == "tags" [
    #b.tags.join(", ")
  ] else if b.type == "metric" {
    grid(
      columns: b.items.map(_ => 1fr),
      ..b.items.map(m => align(center)[
        #text(size: 13pt, weight: "bold")[#m.value] \
        #text(size: 8.5pt, fill: luma(100))[#m.label]
      ])
    )
  } else if b.type == "keyvalue" {
    for pair in b.pairs [*#pair.key:* #pair.value \ ]
  }
}

// ── header ───────────────────────────────────────────────────────────────────

#align(center)[
  #text(size: 22pt, weight: "bold")[#data.name]
  #if data.headline != "" [
    \ #text(size: 11pt, style: "italic")[#data.headline] \
  ]
  #if data.contact.len() > 0 [
    \ #text(size: 9.5pt, fill: luma(80))[#data.contact.map(c =>
      if c.url != "" { link(c.url)[#c.label] } else { c.label }
    ).join("  •  ")]
  ]
  #let loc-parts = (data.location.city, data.location.country).filter(s => s != "")
  #if loc-parts.len() > 0 [
    \ #text(size: 9.5pt, fill: luma(100))[Based in #loc-parts.join(", ")]
  ]
]
#if data.about != "" [
  #text(size: 9.5pt)[#data.about]
]

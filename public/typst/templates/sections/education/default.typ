// section template: education / default

#if data.education.len() > 0 {
  section("Education", {
    for edu in data.education {
      grid(
        columns: (1fr, auto),
        [
          *#edu.title*#if edu.field != "" [, #edu.field]
          \ #text(style: "italic")[#edu.institution]
        ],
        align(right)[
          #text(size: 9.5pt, fill: luma(80))[#period-str(edu.period)]
          #if edu.grade != "" [\ #text(size: 9.5pt, fill: luma(80))[#edu.grade]]
        ]
      )
      for b in edu.blocks { render-block(b) }
      v(0.25em)
    }
  })
}

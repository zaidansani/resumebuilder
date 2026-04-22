// section template: projects / default

#if data.projects.len() > 0 {
  section("Projects", {
    for p in data.projects {
      [*#p.title*#if p.role != "" [ — #p.role] \ ]
      if p.description != "" { [#p.description \ ] }
      if p.technologies.len() > 0 {
        text(size: 9pt, style: "italic")[#p.technologies.join(", ")]
        [ \ ]
      }
      if p.url != "" {
        text(size: 9pt, fill: luma(80))[#p.url]
        [ \ ]
      }
      for b in p.blocks { render-block(b) }
      v(0.25em)
    }
  })
}

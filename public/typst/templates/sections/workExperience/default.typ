// section template: workExperience / default
// Available: `data`, `section`, `period-str`, `render-block` (from global)

#if data.workExperience.len() > 0 {
  section("Experience", {
    for job in data.workExperience {
      grid(
        columns: (1fr, auto),
        [*#job.position* \ #text(style: "italic")[#job.employer]],
        align(right)[#text(size: 9.5pt, fill: luma(80))[#period-str(job.period)]]
      )
      for b in job.blocks { render-block(b) }
      v(0.25em)
    }
  })
}

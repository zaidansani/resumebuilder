// section template: achievements / default

#if data.achievements.len() > 0 {
  section("Achievements", {
    for a in data.achievements {
      
      [*#a.title*]
      if a.date != "" { [ (#a.date.slice(0, 4))] }
      if a.issuingBody != "" { [, #a.issuingBody] }
      v(-0.2em)
      for b in a.blocks { render-block(b) }
      v(-1.5em)
      [ \ ]
    }
  })
}

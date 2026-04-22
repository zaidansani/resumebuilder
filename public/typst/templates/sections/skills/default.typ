// section template: skills / default

#if data.skills.len() > 0 {
  section("Skills", {
    for group in data.skills {
      [*#group.category:* #group.items.join(", ") \ ]
    }
  })
}

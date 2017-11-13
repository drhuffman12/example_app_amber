p = world.name
p = world.body
p = world.draft
p
  a.btn.btn-default.btn-xs href="/worlds" back
  a.btn.btn-success.btn-xs href="/worlds/#{ world.id }/edit" edit
  a.btn.btn-danger.btn-xs href="/worlds/#{ world.id }?_method=delete" onclick="return confirm('Are you sure?');" delete

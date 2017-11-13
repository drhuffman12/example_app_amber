div.row
  div.col-sm-11
    h2 Worlds
  div.col-sm-1
    a.btn.btn-success.btn-xs href="/worlds/new" New
div.table-responsive
  table.table.table-striped
    thead
      tr
        th Name
        th Body
        th Draft
        th Actions
    tbody
    - worlds.each do |world|
      tr
        td = world.name
        td = world.body
        td = world.draft
        td
          span
            a.btn.btn-primary.btn-xs href="/worlds/#{ world.id }" read
            a.btn.btn-success.btn-xs href="/worlds/#{ world.id }/edit" edit
            a.btn.btn-danger.btn-xs href="/worlds/#{ world.id }?_method=delete" onclick="return confirm('Are you sure?');" delete


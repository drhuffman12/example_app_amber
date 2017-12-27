- if world.errors
  ul.errors
  - world.errors.each do |error|
    li = error.to_s

== form(action: "/worlds/#{world.id.to_s}", method: world.id ? :patch : :post) do
  == csrf_tag
  div.form-group
  == text_field(name: "name", value: world.name, placeholder: "Name", class: "form-control")
  div.form-group
  == text_area(name: "body", content: world.body, placeholder: "Body", class: "form-control", size: "30x10")
  div.form-group
  div.checkbox
    == label(:draft)
    == check_box(:draft, checked: world.draft.to_s == "1")
  == submit("Submit", class: "btn btn-primary btn-xs")
  == link_to("back", "/worlds", class: "btn btn-default btn-xs")

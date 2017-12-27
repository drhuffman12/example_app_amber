require "granite_orm/adapter/pg"

class World < Granite::ORM::Base
  adapter pg


  # id : Int64 primary key is created for you
  field name : String
  field body : String
  field draft : Bool
  timestamps
end

class WorldController < ApplicationController
  def index
    worlds = World.all
    render("index.slang")
  end

  def show
    if world = World.find params["id"]
      render("show.slang")
    else
      flash["warning"] = "World with ID #{params["id"]} Not Found"
      redirect_to "/worlds"
    end
  end

  def new
    world = World.new
    render("new.slang")
  end

  def create
    world = World.new(params.to_h.select(["name", "body", "draft"]))

    if world.valid? && world.save
      flash["success"] = "Created World successfully."
      redirect_to "/worlds"
    else
      flash["danger"] = "Could not create World!"
      render("new.slang")
    end
  end

  def edit
    if world = World.find params["id"]
      render("edit.slang")
    else
      flash["warning"] = "World with ID #{params["id"]} Not Found"
      redirect_to "/worlds"
    end
  end

  def update
    if world = World.find(params["id"])
      world.set_attributes(params.to_h.select(["name", "body", "draft"]))
      if world.valid? && world.save
        flash["success"] = "Updated World successfully."
        redirect_to "/worlds"
      else
        flash["danger"] = "Could not update World!"
        render("edit.slang")
      end
    else
      flash["warning"] = "World with ID #{params["id"]} Not Found"
      redirect_to "/worlds"
    end
  end

  def destroy
    if world = World.find params["id"]
      world.destroy
    else
      flash["warning"] = "World with ID #{params["id"]} Not Found"
    end
    redirect_to "/worlds"
  end
end

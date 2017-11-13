require "./spec_helper"

def create_subject
  subject = World.new
  subject.name = "test"
  subject.save
  subject
end

describe WorldController do
  Spec.before_each do
    World.clear
  end

  describe "index" do
    it "renders all the worlds" do
      subject = create_subject
      get "/worlds"
      response.body.should contain "test"
    end
  end

  describe "show" do
    it "renders a single world" do
      subject = create_subject
      get "/worlds/#{subject.id}"
      response.body.should contain "test"
    end
  end

  describe "new" do
    it "render new template" do
      get "/worlds/new"
      response.body.should contain "New World"
    end
  end

  describe "create" do
    it "creates a world" do
      post "/worlds", body: "name=testing"
      subject_list = World.all
      subject_list.size.should eq 1
    end
  end

  describe "edit" do
    it "renders edit template" do
      subject = create_subject
      get "/worlds/#{subject.id}/edit"
      response.body.should contain "Edit World"
    end
  end

  describe "update" do
    it "updates a world" do
      subject = create_subject
      patch "/worlds/#{subject.id}", body: "name=test2"
      result = World.find(subject.id).not_nil!
      result.name.should eq "test2"
    end
  end

  describe "delete" do
    it "deletes a world" do
      subject = create_subject
      delete "/worlds/#{subject.id}"
      result = World.find subject.id
      result.should eq nil
    end
  end
end

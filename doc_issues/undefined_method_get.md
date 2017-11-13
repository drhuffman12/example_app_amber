<!--
Have you read Amber's Code of Conduct? By filing an Issue, you are expected to comply with it, including treating everyone with respect: https://github.com/amberframework/amber/blob/master/.github/CODE_OF_CONDUCT.md
Do you want to ask a question? Are you looking for support? The Amber message board is the best place for getting support: https://gitter.io/amberframework/amber
-->

# ISSUE

## Title
----
[error: `undefined method 'get'` in scaffolded specs #387](https://github.com/amberframework/amber/issues/387)

## Description
----

(FYI, https://gitter.io/amberframework/amber is down ... "can’t be reached".)

### Description

The scaffolded specs fail, noting the following error: `undefined method 'get'`.

### Steps to Reproduce

1. Clone [example_app_amber](https://github.com/drhuffman12/example_app_amber) and switch to the [drhuffman12/example_list_page](https://github.com/drhuffman12/example_app_amber/tree/drhuffman12/example_list_page) branch.

  * See also the steps noted in:
    * [Initial App Setup](https://github.com/drhuffman12/example_app_amber/blob/drhuffman12/example_list_page/doc/tutorial/a.initial_app_setup.md)
    * [Example "Hello World" list page](https://github.com/drhuffman12/example_app_amber/blob/drhuffman12/example_list_page/doc/tutorial/b.example_list_page.md)

2. Build, launch the docker container for the app

```sh
docker-compose build
docker-compose up -d # or without "-d" in a separate terminal
```

2. Shell into the docker container for the app

```sh
docker-compose exec app /bin/bash
```

3.  Based on the steps in the  [Initial App Setup](https://github.com/drhuffman12/example_app_amber/blob/drhuffman12/example_list_page/doc/tutorial/a.initial_app_setup.md) and [Example "Hello World" list page](https://github.com/drhuffman12/example_app_amber/blob/drhuffman12/example_list_page/doc/tutorial/b.example_list_page.md), after running the following steps, you end up with the `undefined method 'get'` error:

```sh
amber db migrate
crystal spec
```

**Expected behavior:** [What you expect to happen]

The specs should run; in particular, the `get "/worlds"` line should not error.

**Actual behavior:** [What actually happens]

Running `crystal spec` on the amber-scaffold-generated controller gives the following error:

```txt
Error in line 2: while requiring "./spec/controllers/world_controller_spec.cr"

in spec/controllers/world_controller_spec.cr:18: undefined method 'get'

      get "/worlds"
```

The Amber-scaffold-generated "spec/controllers/world_controller_spec.cr" file starts with the following code:

```code
01: require "./spec_helper"
02:
03: def create_subject
04:   subject = World.new
05:   subject.name = "test"
06:   subject.save
07:   subject
08: end
09:
10: describe WorldController do
11:   Spec.before_each do
12:     World.clear
13:   end
14:
15:   describe "index" do
16:     it "renders all the worlds" do
17:       subject = create_subject
18:       get "/worlds"
19:       response.body.should contain "test"
20:     end
```

**Reproduces how often:** [What percentage of the time does it reproduce?]

100%

### Versions

You can get this information from copy and pasting the output of `amber --version` and `amber --version` from the command line. Also, please include the OS and what version of the OS you're running.

```sh
root@8e729438f739:/app/local# crystal --version
Crystal 0.23.1 [e2a1389] (2017-07-13) LLVM 3.8.1

root@8e729438f739:/app/local# shards --version
Shards 0.7.1 (2017-07-13)

root@8e729438f739:/app/local# amber --version
Amber CMD (amberframework.org) - v0.3.0
```

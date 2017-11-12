
# Installation

## Dependancies

Follow Installation steps at:
https://github.com/amberframework/amber

```sh
sudo apt-get install build-essential libreadline-dev libsqlite3-dev libpq-dev libmysqlclient-dev libssl-dev

cd $LOCAL_DEV_FOLDER_ROOT
mkdir amberframework
cd amberframework

git clone git@github.com:amberframework/amber.git
cd amber/

# Crystal version matching what is noted in ![.shard.yml](.shard.yml)
#  e.g.: one of the below echo commands
echo "0.23.1" > .crystal-version # ... if you have 0.23.1 installed via crenv
echo "system" > .crystal-version # and have Crystal v 0.23.1 installed outside crenv

shards install
make install

```

## Initial Amber-scaffolded app core

```sh
cd $LOCAL_DEV_FOLDER_ROOT
cd $MY_PROJECTS_SUB_ROOT

amber new example_app_amber -d pg -t slang --deps
```

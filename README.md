# [example_app_amber](https://github.com/drhuffman12/example_app_amber)

Example Hello World web app written in [Amber](https://github.com/amberframework/amber) based on their docs.

## Installation Dependancies
----

For Docker-compose, see:

* https://docs.docker.com/compose/install/#install-compose

For Amber, see:

* https://github.com/amberframework/amber

### Example local setup

```sh
sudo apt-get install build-essential libreadline-dev libsqlite3-dev libpq-dev libmysqlclient-dev libssl-dev

# pip uninstall docker-py; pip uninstall docker; pip install docker
sudo curl -L https://github.com/docker/compose/releases/download/1.17.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version # => docker-compose version 1.17.1, build 6d101fb

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

## Initial creation of your Amber-scaffolded application
----

```sh
cd $LOCAL_DEV_FOLDER_ROOT
cd $MY_PROJECTS_SUB_ROOT

amber new example_app_amber -d pg -t slang --deps
cd example_app_amber

# Crystal version matching what is noted in ![.shard.yml](.shard.yml)
#  e.g.: one of the below echo commands
echo "0.23.1" > .crystal-version # ... if you have 0.23.1 installed via crenv
echo "system" > .crystal-version # and have Crystal v 0.23.1 installed outside crenv

shards install
```

## Dockerized
----

### Build Docker images

```sh
docker-compose build

docker-compose

```

### (As needed) Cleanup ALL docker images and containers

**WARNING, this is for "ALL"**

You might have to run these more than once until each command says something like `"docker <cmd>" requires at least 1 argument(s).`

#### Stop ALL containers

```sh
docker kill $(docker ps -q)
```

#### Remove all containers

```sh
docker rm $(docker ps -a -q)
```

#### Remove all docker images

```sh
docker rmi -f $(docker images -q)
```

#### (or all together)

```sh
docker kill $(docker ps -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker images -q)
```

* View current services:

```sh
docker-compose config --services
```

### Launch the Docker containers

#### If you want to watch the STDIO of the docker containers:

In a separate terminal, type:

```sh
docker-compose run app
```

* CTRL-c at any time should shut down the containers.

#### If you don't care to watch the STDIO of the docker containers:

In a terminal, type (to background it):

```sh
docker-compose run -d app
```

* To shutdown the docker containers, type:

```sh
docker-compose stop app
```

### Verify that your docker containers are up and running

To view the running containers, type:

```sh
$ docker ps -a
```

This should show something like:

```sh
$ docker ps -a
CONTAINER ID        IMAGE                          COMMAND                  CREATED              STATUS                      PORTS                              NAMES
2a6336a9c3b3        example_app_amber              "amber watch"            About a minute ago   Up About a minute                                              exampleappamber_app_run_1
58b21e4c5dc3        postgres                       "docker-entrypoint..."   About a minute ago   Up About a minute           5432/tcp                           exampleappamber_db_1
0a1b4481bee7        drujensen/mailcatcher:latest   "mailcatcher -f --..."   About a minute ago   Up About a minute           1025/tcp, 0.0.0.0:1080->1080/tcp   exampleappamber_mail_1
```

### Shell into your launched dockerized app

In your terminal for shelling into your dockerized app, type:

```sh
docker-compose exec app
# docker-compose exec app -li
```

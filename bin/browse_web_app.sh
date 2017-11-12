#!/bin/bash

# i.e.: xdg-open http://localhost:3000/

MY_APP_URL=http://localhost:3000/

if which xdg-open > /dev/null
then
  xdg-open $MY_APP_URL
elif which gnome-open > /dev/null
then
  gnome-open $MY_APP_URL
fi

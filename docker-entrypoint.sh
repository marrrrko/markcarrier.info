#!/bin/bash

if [ "$APP" = "blog" ]; then
  echo "Launching blog app"
  node servers/blog.js
elif [ "$APP" = "resume" ]; then
  echo "Launching resume app"
  node servers/resume.js
else 
  echo "Launching landing page app"
  node servers/landing-page.js
fi

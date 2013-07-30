# h2o

Boilerplate for an [express][express-link] web application

[![Build Status](https://travis-ci.org/pixelsandbytes/h2o.png?branch=master)](https://travis-ci.org/pixelsandbytes/h2o)

## Features
- Use clusters and domains to handle async errors in a configurable manner
- Ensure uptime by automatically killing and restarting worker processes upon encountering an error
- Allow full customization of logging and response sending
- Minimal number of dependencies

## Installation
1. Add `h2o` as a dependency to your project’s `package.json`
2. Run `npm install`

## Usage Examples

See [examples/][examples-link] for express web applications built using h2o.

## Documentation

    h2o()
        .setAppDefiner(function(app) {...})
        .setLogger(...)
        .setErrorHandler(function(err, req, res, nextNotUsed) {...})
        .setPort(8765)
        .setClusterUse(true)
        .setNumWorkersInCluster(2)
        .run();

__setAppDefiner__ (required)  
Must be called with a function that defines the application. The provided function will be called with `app` provided.

__setLogger__ (required)  
Must be called with a logger object that implements `info(message)`, `warn(message)`, `error(message)`, and `fatal(message)`.

__setErrorHandler__ (required)  
Must be called with a function that handles any errors that occur. The provided function will be called with `(err, req, res, nextNotUsed)`.

__setPort__ (optional)  
Can be called to port that the web application listens on.  Defaults to 80.

__setClusterUse__ (optional)  
Can be called to set whether a cluster is used or not to.  Using a cluster enables a worker process to restart if an error occurs. Defaults to true.

__setNumWorkersInCluster__ (optional)  
Can be called to set the number of workers to fork in the cluster.  Defaults to the number of CPUs/cores.

[express-link]: http://expressjs.com
[examples-link]: examples
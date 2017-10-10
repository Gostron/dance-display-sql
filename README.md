
![danceDisplaySql](logo.png)

# danceDisplaySql

> Server for handling dance competitions

_Generates with [Yeoman][yeoman] and the generator <https://github.com/blueskyfish/generator-express-restful-mysql.git>._

## Table of Content

* [TODOs](#user-content-todos)
* [Execute the Application](#user-content-execute-the-application)
* [Endpoints](#user-content-endpoints)
* [Deployment](#user-content-deployment)
	* [Parameters](#user-content-parameters)
	* [Setting File](#user-content-setting-file)
* [Home Directory](#user-content-home-directory)
* [MySql Transaction](#user-content-mysql-transaction)
* [Logging](#user-content-logging)
* [Generate Documentation](#user-content-generate-documentation)
* [License](#user-content-license)

## TODOs

Some settings or replacement cannot be done with the generator. After doing this, you can delete this section.

* Choose a license (e.g: The MIT Licence).
* Set the version in the `package.json`.
* Replace the Logo (`logo.png`).
* Replace with own hero ascii art _(example: <http://patorjk.com/software/taag/>)_ (`hero.txt`).
* Add a description into the `package.json` and to the summary of this readme file.
* Execute `$ npm install` to resolve and load the dependencies.
* Create a git repository with `$ git init` and add your git user information `$ git config user.name "dance-display-sql" && git config user.email ""`
* Create a remote repository on [Github][github] with the name `dance-display-sql`. It should look after: `https://github.com/dance-display-sql/dance-display-sql.git`

## Execute the Application

```sh
$ node server.js [--verbose | -v] [--help] --config=/path/to/configuration.json
```

## Endpoints

There are 2 endpoints after starting the application.

* `/about`
* `/mysql/show/databases`

> **Note**: If the tool `apidoc` is installed, you can view the documentation on Endpoints in directory `apidoc`: call `npm run apidoc`.


## Deployment

Deploying of the application needs some settings on the computer machine.

* Parameters
* Setting File

### Parameters

Name                      | Type    | Required | Description
--------------------------|---------|----------|-------------------------------------------
`--verbose` | `-v`        | boolean | no       | Show more logging messages
`--help`                  | boolean | no       | Shows the help
`--log=/path/of/loggging` | string  | yes      | Contains the directory how the log messages are written.
`--config=/path/to`       | string  | yes      | The filename with the path to the configuration json file.


## Generate Documentation

There are two commands for generating the jsDoc and the apidoc for the endpoints:

* jsDoc: `npm run jsdoc` generates the jsdoc in the directory `jsdoc`
* apidoc: `npm run apidoc` generates the apidoc of the endpoints in the directory `apidoc`.

## License

```
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
```


[github]: https://github.com
[yeoman]: http://yeoman.io

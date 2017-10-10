
![danceDisplaySql](logo.png)

# Dance Display SQL

> Server for handling dance competitions. It is the evolution of the no-sql v1

_Generates with [Yeoman][yeoman] and the generator <https://github.com/blueskyfish/generator-express-restful-mysql.git>._

## Table of Content

* [Current features](#current-features)
* [Remaining](#remaining)
* [Possible features](#possible-features)
* [License](#license)

## Current features

Feature | Description
------- | -----------
Presentation during competition | Gives a nice looking screen for a projector or screen to be displayed for the audience. Handles categories, rounds, results and pauses.
Judges interface | Judges are able to mark and note contestants using this server as model.
Contestants interface | Contestants can be notified when they need to prepare, they can see their categories and all information concerning them.
Public interface | Everyone can visit stats, categories, explanations, etc. on their phone.

## Remaining

Everything is to be done right now.

## Possible features

The following ideas can and/or will be implemented:
* Handling two scenes at the same competition (two displays or one that can handle both)
* Interface for contestants
	* Notifications for categories they are expected
	* List of categories they are subscribed to and their details
* Interface for the public (personal use on mobile)
* Judges interface
	* Notations and marks
* Interface for the organization committee
	* Results compilation
	* Judges completion
* Sponsor integration
* Before and after competitions
	* Events visibility
	* General stats
	* Contestants and judges details
* Event streaming
* Video service for contestants
	* Multi-POV stream
	* Automatic compilation for a round and a contestant

## License

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) GNU General Public Licence v3.0

[github]: https://github.com
[yeoman]: http://yeoman.io

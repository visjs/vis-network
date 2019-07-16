# vis.js

:warning: **This module has not been released yet!**<br>
:warning: **This repository is currently under hayily development.**<br>
:warning: **The Git history might be overwritten at any time!**<br>
:warning: **Please come back later in a few days for updates!**


Vis.js is a dynamic, browser based visualization library.
The library is designed to be easy to use, handle large amounts
of dynamic data, and enable manipulation of the data.
The library consists of the following components:

- DataSet and DataView. A flexible key/value based data set. Add, update, and
  remove items. Subscribe on changes in the data set. A DataSet can filter and
  order items, and convert fields of items.
- DataView. A filtered and/or formatted view on a DataSet.
- Graph2d. Plot data on a timeline with lines or barcharts.
- Graph3d. Display data in a three dimensional graph.
- Network. Display a network (force directed graph) with nodes and edges.
- Timeline. Display different types of data on a timeline.

The vis.js library was initially developed by [Almende B.V](http://almende.com) and is now maintained by the [visjs community](https://github.com/visjs).

## Badges

[![GitHub contributors](https://img.shields.io/github/contributors/visjs/vis-charts.svg)](https://github.com/visjs/vis-charts/graphs/contributors)
[![GitHub stars](https://img.shields.io/github/stars/visjs/vis-charts.svg)](https://github.com/almende/vis/stargazers)

[![Backers on Open Collective](https://opencollective.com/visjs/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/visjs/sponsors/badge.svg)](#sponsors) 

## Install

Install via npm:

    $ npm install vis-charts

## Load

To use a component, include the javascript and css files of vis in your web page:

```html
<!DOCTYPE HTML>
<html>
<head>
  <script src="webroot/vis/dist/vis.min.js"></script>
  <link href="webroot/vis/dist/vis.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
  <script type="text/javascript">
    // ... load a visualization
  </script>
</body>
</html>
```

A timeline can be instantiated as:

```js
var timeline = new vis.Timeline(container, data, options);
```

Where `container` is an HTML element, `data` is an Array with data or a DataSet,
and `options` is an optional object with configuration options for the
component.


## Example

A basic example on loading a Timeline is shown below. More examples can be
found in the [examples directory](https://github.com/almende/vis/tree/master/examples)
of the project.

```html
<!DOCTYPE HTML>
<html>
<head>
  <title>Timeline basic demo</title>
  <script src="vis/dist/vis.min.js"></script>
  <link href="vis/dist/vis.min.css" rel="stylesheet" type="text/css" />

  <style type="text/css">
    body, html {
      font-family: sans-serif;
    }
  </style>
</head>
<body>
<div id="visualization"></div>

<script type="text/javascript">
  var container = document.getElementById('visualization');
  var data = [
    {id: 1, content: 'item 1', start: '2013-04-20'},
    {id: 2, content: 'item 2', start: '2013-04-14'},
    {id: 3, content: 'item 3', start: '2013-04-18'},
    {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
    {id: 5, content: 'item 5', start: '2013-04-25'},
    {id: 6, content: 'item 6', start: '2013-04-27'}
  ];
  var options = {};
  var timeline = new vis.Timeline(container, data, options);
</script>
</body>
</html>
```

## Build

To build the library from source, clone the project from github

    $ git clone git://github.com/visjs/vis-charts.git

The source code uses the module style of node (require and module.exports) to
organize dependencies. To install all dependencies and build the library,
run `npm install` in the root of the project.

    $ cd vis
    $ npm install

Then, the project can be build running:

    $ npm run build

## Test

To test the library, install the project dependencies once:

    $ npm install

Then run the tests:

    $ npm run test

## Contribute

Contributions to the vis.js library are very welcome! We can't do this alone!

### Contributors

This project exists thanks to all the people who already contributed:
<a href="graphs/contributors"><img src="https://opencollective.com/visjs/contributors.svg?width=890" /></a>

### Backers

Thank you to all our backers! 🙏

<a href="https://opencollective.com/vis#backers" target="_blank"><img src="https://opencollective.com/visjs/backers.svg?width=890"></a>

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.

<a href="https://opencollective.com/visjs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/9/avatar.svg"></a>

## License

Copyright (C) 2010-2018 Almende B.V. and Contributors

Vis.js is dual licensed under both

  * The Apache 2.0 License
    http://www.apache.org/licenses/LICENSE-2.0

and

  * The MIT License
    http://opensource.org/licenses/MIT

Vis.js may be distributed under either license.

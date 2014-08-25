debuguy
=======

#  [![Build Status](https://secure.travis-ci.org/seiyugi/debuguy.png?branch=master)](http://travis-ci.org/seiyugi/debuguy)

> An unintrusive log analysis/debugging/profiling framework


## Getting Started

Install the module with: `npm install debuguy`

```js
var debuguy = require('debuguy');
debuguy.parse(sourceDir, outputDir); // "awesome"
```

Install with cli command

```sh
$ npm install -g debuguy
$ debuguy --help
$ debuguy --version
```


```sh
# creates a browser.js
$ grunt browserify
```

## Documentation

At build time debuguy parses comments of a predefined format and replace them with console.log expressions. These console.log are passed to a HTML reporter at run time to generate an activity diagram.

The comment format to be specified in javascript source file is:
```js
/* debuguy: tab('<TAG_NAME>') */
```
Run ```debuguy parse``` to replace ```debuguy``` comments with console.log expressions. For now ```<SOURCE_DIR>``` and ```<OUTPUT_DIR>``` are ended with ```/```.
```sh
$ debuguy parse <SOURCE_DIR> <OUTPUT_DIR>
```


## Examples

Parsing and replacing ```debuguy``` comments:
```sh
$ debuguy parse ./lib/ ./debug/
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).

1. Fork ```debuguy``` repository.
2. ```sh $ git clone ssh://github.com/<YOUR_NAME>/debuguy```
3. In the local folder, run ```sh $ npm install -g .```


## License

Copyright (c) 2014 seiyugi  
Licensed under the MPL license.

Transform es6 (+ react) project to typescript

<b>Work in Progress</b>

## Feature

Copy `.js` file to `.ts` or `.tsx` (Auto detect).

Transform code, make sure tsc works good.

## TODO

Cli tool

Configurable (babel opts, fs opts, etc)

Support more syntax

Parse React propTypes

Improve algorithm

## How to

I'll support a cli tool.

Now create a js file, import this library, and write:

````js
const {transformDir} = require('es2ts')

transformDir('/path/to/project', undefined/* dist directory, default is project self */, {
  // glob options
  ignore: [
    '**/__story__/**',
    '**/__tests__/**',
    '/asserts/**',
  ]
})
.then(function () {
  console.log('transform success')
})

````

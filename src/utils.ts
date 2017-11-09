import * as _ from 'lodash'
import * as babel from 'babel-core'
import * as babelTypes from 'babel-types'
import babelTraverse from 'babel-traverse'

type codeType = string|babel.Node;

/**
 * detect the code includes jsx or not
 */
export function includeJSX (code: codeType): boolean {
  const ast = getAST(code)
  let isIncludeJsx = false

  babelTraverse(ast, {
    enter(path) {
      if (path.node.type === 'JSXElement') {
        isIncludeJsx = true
      }
    }
  })
  return isIncludeJsx
}

export function getAST (code: codeType): babelTypes.File {
  if (typeof code === 'string') {
    const { ast } = babel.transform(code, {
      "presets": [],
      "plugins": [
        "syntax-typescript",
        "syntax-jsx",
        "syntax-class-properties"
      ]
    })
    return <babelTypes.File>ast
  }
  return <babelTypes.File>code
}
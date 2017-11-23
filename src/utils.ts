import * as _ from 'lodash'
import * as babel from 'babel-core'
import * as types from 'babel-types'
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

export function getAST (code: codeType): types.File {
  if (typeof code === 'string') {
    const { ast } = babel.transform(code, {
      // TODO: configurable
      "presets": [],
      "plugins": [
        "syntax-typescript",
        "syntax-jsx",
        "syntax-class-properties",
        "syntax-object-rest-spread",
        "syntax-dynamic-import",
      ]
    })
    return <types.File>ast
  }
  return <types.File>code
}

export interface IGetComponentLabel {
  reactLabel: string;
  comopnentLabel: string;
  pureComponentLabel: string;
  stateLessLabel: string;
}

/**
 * get `component` label
 * Component keyword come from react import declaration, look like:
 *   import React, {Comopnent, PureComponent} from 'react'
 * or use React.Component / React.PureComponent directly.
 */
export function getComponentLabel (ast: types.File): IGetComponentLabel {
  let reactLabel = 'React'
  let comopnentLabel = ''
  let pureComponentLabel = ''
  let stateLessLabel = ''
  ast.program.body.forEach(node => {
    if (node.type === 'ImportDeclaration' && node.source.value === 'react') {
      node.specifiers.forEach(s => {
        if (s.type === 'ImportDefaultSpecifier') {
          reactLabel = s.local.name
        } else if (s.type === 'ImportSpecifier') {
          if (s.imported.name === 'Component') {
            comopnentLabel = s.local.name
          } else if (s.imported.name === 'PureComponent') {
            pureComponentLabel = s.local.name
          } else if (s.imported.name === 'Stateless') {
            stateLessLabel = s.local.name
          }
        }
      })
    }
  })
  return {
    reactLabel,
    comopnentLabel: comopnentLabel || `${reactLabel}.Component`,
    pureComponentLabel: pureComponentLabel || `${reactLabel}.PureComponent`,
    stateLessLabel: stateLessLabel || `${reactLabel}.Stateless`,
  }
}

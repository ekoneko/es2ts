import * as babel from 'babel-core'
import * as types from 'babel-types'
import generator from 'babel-generator'
import traverse from 'babel-traverse'

import Abstract, { TranserInterface } from './transers/Abstract'
import ExtendTranser from './transers/extend'
import ImplicitStaticVaribleTranser from './transers/implicitStaticVarible'
import ClassPropertiesTranser from './transers/classProperties'
import StyleComponentsTranser from  './transers/styleComponents'
import ImplicitObjectAnyTranser from './transers/ImplicitObjectAny'
import StatelessTranser from './transers/stateless'

const makeBeforeTraverse = (transers: TranserInterface[]) => (ast, content) => {
  transers.forEach(transer => transer.before(ast, content))
}

const makeAfterTraverse = (transers: TranserInterface[]) => (ast, content) => {
  transers.forEach(transer => transer.after(ast, content))
}

const makeExecTraverse = (transers: TranserInterface[]) => (path, ast, content) => {
  transers.forEach(transer => transer.exec(path, ast, content))
}

const walk = (transers: TranserInterface[]) => (ast: types.File, content) => {
  const beforeTraverse = makeBeforeTraverse(transers)
  const afterTraverse = makeAfterTraverse(transers)
  const execTraverse = makeExecTraverse(transers)

  beforeTraverse(ast, content)
  traverse(ast, {
    enter(path) {
      execTraverse(path, ast, content)
    }
  })
  afterTraverse(ast, content)
}

export default function transform (ast: types.File, content: string): string {
  walk([
    new ExtendTranser(),
    new ImplicitStaticVaribleTranser(),
    new ClassPropertiesTranser(),
    new StyleComponentsTranser(),
    new ImplicitObjectAnyTranser(),
    new StatelessTranser(),
  ])(ast, content)

  const {code} = generator(ast, {}, content)
  return code
}

/**
 * walk part of transers (for test one transer)
 * @param ast
 * @param content
 */
export function transformPartial (TranserClass) {
  return function (ast: types.File, content: string): string {
    walk([new TranserClass()])(ast, content)

    const {code} = generator(ast, {}, content)
    return code
  }
}

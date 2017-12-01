import * as babel from 'babel-core'
import { NodePath } from 'babel-traverse'
import * as types from 'babel-types'
import AbstractTranser from './Abstract'

/**
 * Add `any` declaration for empty object ({})
 * example:
 * const o = {} => const o: any = {}
 */
export default class ImplicitObjectAnyTranser extends AbstractTranser {
  exec(path: NodePath, ast: types.File, content: string) {
    // if (path.isFunctionDeclaration()) {
      //   console.log(JSON.stringify(path.node, undefined, 2))
      // }
      if (path.isVariableDeclarator()) {
        const node = <types.VariableDeclarator>path.node
        addDeclareAny(node.id, node.init)
      }
      if (path.isAssignmentPattern()) {
        const node = <types.AssignmentPattern>path.node
        addDeclareAny(node.left, node.right)
      }
  }
}

function addDeclareAny (name: types.Node, value: types.Node) {
  if (!types.isIdentifier(name)) return
  if (!types.isObjectExpression(value)) return
  if (value.properties.length > 0) return
  name.name += ': any'
}

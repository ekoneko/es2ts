import * as babel from 'babel-core'
import { NodePath } from 'babel-traverse'
import * as types from 'babel-types'
import AbstractTranser from './Abstract'

/**
 * Add class properties's declaration
 */
export default class ClassPropertiesTranser extends AbstractTranser {
  exec(path: NodePath, ast: types.File, content: string) {
    const {node} = path
    if (!types.isClassDeclaration(node) && !types.isClassExpression(node)) return

    // TODO: detect verify class is react
    const definedNames = ['state', 'props', 'context']
    const unDefinedNames = []

    path.traverse({
      ClassProperty({node}) {
        if (types.isIdentifier(node.key)) {
          definedNames.push(node.key.name)
        }
      },
      ClassMethod({node}) {
        if (types.isIdentifier(node.key)) {
          definedNames.push(node.key.name)
        }
      },
      ThisExpression(path) {
        if (!path.parentPath.isMemberExpression()) return
        const property = (<types.MemberExpression>path.parent).property
        if (
          !types.isIdentifier(property) ||
          definedNames.indexOf(property.name) > -1 ||
          unDefinedNames.indexOf(property.name) > -1
        ) {
          return
        }
        unDefinedNames.push(property.name)
      },
    })

    const { ast: declareAst } = babel.transform(`
      class Temp {
        ${unDefinedNames.map(p => `private ${p}: any`).join('\n')}
      }
    `, {
      plugins: ["syntax-typescript", "syntax-class-properties"]
    })

    const classDeclare = <types.ClassDeclaration>(<types.File>declareAst).program.body[0]
    node.body.body.splice(0, 0, ...classDeclare.body.body)
  }
}

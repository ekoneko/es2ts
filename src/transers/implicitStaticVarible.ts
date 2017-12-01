import * as babel from 'babel-core'
import { NodePath } from 'babel-traverse'
import * as types from 'babel-types'
import AbstractTranser from './Abstract'

/**
 * Add declare for implicite static varible
 */
export default class ImplicitStaticVarible extends AbstractTranser {
  private properties = {}
  private classNodes = {}

  exec(path: NodePath, ast: types.File, content: string) {
    const { node } = path
    if (types.isClassDeclaration(node) || types.isClassExpression(node)) {
      this.classNodes[node.id.name] = node
    }
    if (
      types.isAssignmentExpression(node, {operator: '='}) &&
      types.isMemberExpression(node.left) &&
      types.isIdentifier(node.left.object) &&
      types.isIdentifier(node.left.property)
    ) {
      this.properties[node.left.object.name] = this.properties[node.left.object.name] || []
      this.properties[node.left.object.name].push(node.left.property.name)
    }
  }

  after(ast: types.File, content: string) {
    for (let className in this.classNodes) {
      const propertie = this.properties[className]
      const classNode = this.classNodes[className]
      if (propertie) {
        const { ast: declareAst } = babel.transform(`
          class Temp {
              ${propertie.map(p => `static ${p}`).join('\n')}
            }
        `, {
          plugins: ["syntax-typescript", "syntax-class-properties"]
        })
        const classDeclare = <types.ClassDeclaration>(<types.File>declareAst).program.body[0]
        classNode.body.body.splice(0, 0, ...classDeclare.body.body)
      }
    }
  }
}

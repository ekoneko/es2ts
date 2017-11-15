import * as babel from 'babel-core'
import traverse from 'babel-traverse'
import * as types from 'babel-types'

/**
 * Add declare for implicite static varible
 */
export default function (ast: types.File, content: string) {
  let classNode
  const properties = {}
  const classNodes = {}

  traverse(ast, {
    enter(path) {
      const { node } = path
      if (types.isClassDeclaration(node) || types.isClassExpression(node)) {
        classNodes[node.id.name] = node
      }
      if (
        types.isAssignmentExpression(node, {operator: '='}) &&
        types.isMemberExpression(node.left) &&
        types.isIdentifier(node.left.object) &&
        types.isIdentifier(node.left.property)
      ) {
        properties[node.left.object.name] = properties[node.left.object.name] || []
        properties[node.left.object.name].push(node.left.property.name)
      }
    }
  })

  for (let className in classNodes) {
    const propertie = properties[className]
    const classNode = classNodes[className]
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

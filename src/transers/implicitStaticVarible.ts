import * as babel from 'babel-core'
import * as babelTypes from 'babel-types'

/**
 * Add declare for implicite static varible
 */
export default function (ast: babelTypes.File, content: string) {
  // TODO: multiple class declare in one file?
  let classNode
  const properties = []
  for (let i = 0; i < ast.program.body.length; i++) {
    let node  = ast.program.body[i]

    if (node.type === 'ExportNamedDeclaration') {
      node = <any>node.declaration
    } else if (node.type === 'ExportDefaultDeclaration') {
      node = <any>node.declaration
    }

    if (node && node.type === 'ClassDeclaration') {
      classNode = node
    } else if (classNode && node.type === 'ExpressionStatement') {
      const expression = node.expression

      if (
        expression &&
        expression.type === 'AssignmentExpression' &&
        expression.operator === '=' &&
        expression.left.type === 'MemberExpression' &&
        expression.left.object.type === 'Identifier' &&
        expression.left.property.type === 'Identifier'
      ) {
        if (expression.left.object.name === classNode.id.name) {
          properties.push(expression.left.property.name)
        }
      }
    }
  }

  if (classNode && properties.length) {
    const { ast: declareAst } = babel.transform(`
      class Temp {
        ${properties.map(p => `static ${p}`).join('\n')}
      }
    `, {
      plugins: ["syntax-typescript", "syntax-class-properties"]
    });
    const classDeclare = <babelTypes.ClassDeclaration>(<babelTypes.File>declareAst).program.body[0]

    classNode.body.body.splice(0, 0, ...classDeclare.body.body)
  }
}

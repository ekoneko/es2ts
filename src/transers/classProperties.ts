import * as babel from 'babel-core'
import traverse from 'babel-traverse'
import * as babelTypes from 'babel-types'

/**
 * Add class properties's declaration
 */
export default function (ast: babelTypes.File, content: string) {
  traverse(ast, {
    enter(path) {
      const {node} = path
      if (!babel.types.isClassDeclaration(node) && !babel.types.isClassExpression(node)) return

      // TODO: detect verify class is react
      const definedNames = ['state', 'props', 'context']
      const unDefinedNames = []
      traverse(node.body, {
        enter(path) {
          const { node, parent, scope, parentPath} = path
          if (node.type === 'ClassProperty') {
            definedNames.push((<babelTypes.ClassProperty>node).key.name)
          }

          if (node.type === 'ThisExpression') {
            const property = (<babelTypes.MemberExpression>parent).property
            if (property && property.type === 'Identifier') {
              if (
                definedNames.indexOf(property.name) === -1 &&
                unDefinedNames.indexOf(property.name) === -1 &&
                parentPath.parent.type !== 'CallExpression' // not call class method
              ) {
                unDefinedNames.push(property.name)
              }
            }
          }
        }
      }, path.scope)

      const { ast: declareAst } = babel.transform(`
        class Temp {
          ${unDefinedNames.map(p => `private ${p}: any`).join('\n')}
        }
      `, {
        plugins: ["syntax-typescript", "syntax-class-properties"]
      });
      const classDeclare = <babelTypes.ClassDeclaration>(<babelTypes.File>declareAst).program.body[0]
      node.body.body.splice(0, 0, ...classDeclare.body.body)
    }
  })
}

import * as babel from 'babel-core'
import * as types from 'babel-types'
import traverse from 'babel-traverse'

/**
 * Add declare for implicite static varible
 */
export default function (ast: types.File, content: string) {
  const styledComponent = getStyledComponentName(ast)
  if (!styledComponent) return

  traverse(ast, {
    enter(path) {
      const { node, parentPath } = path
      if (node.type === 'Identifier' && (<types.Identifier>node).name === styledComponent.name) {
        if (
          parentPath.type !== 'MemberExpression' &&
          parentPath.parent.type !== 'TaggedTemplateExpression'
        ) return

        let taggedTemplateExpression = parentPath.parentPath

        for (let i = 0; i < 3; i++) {
          if (taggedTemplateExpression.type === 'TaggedTemplateExpression') break;
          taggedTemplateExpression = taggedTemplateExpression.parentPath
        }
        if (taggedTemplateExpression.type !== 'TaggedTemplateExpression') return

        let quasi = (<types.TaggedTemplateExpression>taggedTemplateExpression.node).quasi
        // NOTE: look for one more parent if with `.attr()` or etc
        if (!quasi) return
        const expressions = quasi.expressions
        for (let i in expressions) {
          const expression = expressions[i]
          if (expression.type === 'ArrowFunctionExpression') {
            expression.params.forEach((param: types.Identifier) => {
              param.name = `(${param.name}: any)`
            })
          }
        }
        if (expressions.length > 0) {
          const variableDeclarator = <types.VariableDeclarator>taggedTemplateExpression.parent
          addPropTypes(variableDeclarator)

          addStyledComponentClassRef(styledComponent.node)
        }
      }
    }
  })
}

/**
 * get styled component name
 * eg: `import styled from 'styled-components'` the name is `styled`
 * @param ast
 */
function getStyledComponentName (ast: types.File) {
  for (let i in ast.program.body) {
    const node = ast.program.body[i]
    if (node.type !== 'ImportDeclaration' || node.source.value !== 'styled-components') continue
    for (let j in node.specifiers) {
      const specifier = node.specifiers[j]
      if (specifier.type !== 'ImportDefaultSpecifier') continue
      return {
        name: specifier.local.name,
        node: node,
      }
    }
  }
  return null
}

/**
 * transform
 * const Title = styled.p(...)
 * to
 * const Title: StyledComponentClass<any, {}> = styled.p(...)
 */
function addPropTypes (node: types.VariableDeclarator) {
  if (
    node.type === 'VariableDeclarator' && node.id.type === 'Identifier'
  ) {
    node.id.name += ': StyledComponentClass<any, {}>'
  }
}

/**
 *
 */
function addStyledComponentClassRef (node: types.ImportDeclaration) {
  const {ast} = babel.transform(`
    import {StyledComponentClass} from 'styled-components'
  `)
  const specifier = (<types.ImportDeclaration>(<types.File>ast).program.body[0]).specifiers[0]
  for (let i in node.specifiers) {
    const s = node.specifiers[i]
    if (s.type === 'ImportSpecifier' && s.imported.name === 'StyledComponentClass') {
      return // skip insert `StyledComponentClass`
    }
  }
  node.specifiers.push(specifier)
}

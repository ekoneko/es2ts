import * as babel from 'babel-core'
import * as babelTypes from 'babel-types'
import traverse from 'babel-traverse'
import { variableDeclaration } from 'babel-types';

/**
 * Add declare for implicite static varible
 */
export default function (ast: babelTypes.File, content: string) {
  const styledComponent = getStyledComponentName(ast)
  if (!styledComponent) return

  traverse(ast, {
    enter(path) {
      const { node, parentPath } = path
      if (node.type === 'Identifier' && (<babelTypes.Identifier>node).name === styledComponent.name) {
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

        let quasi = (<babelTypes.TaggedTemplateExpression>taggedTemplateExpression.node).quasi
        // NOTE: look for one more parent if with `.attr()` or etc
        if (!quasi) return
        const expressions = quasi.expressions
        for (let i in expressions) {
          const expression = expressions[i]
          if (expression.type === 'ArrowFunctionExpression') {
            expression.params.forEach((param: babelTypes.Identifier) => {
              param.name = `(${param.name}: any)`
            })
          }
        }
        if (expressions.length > 0) {
          const variableDeclarator = <babelTypes.VariableDeclarator>taggedTemplateExpression.parent
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
function getStyledComponentName (ast: babelTypes.File) {
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
function addPropTypes (node: babelTypes.VariableDeclarator) {
  if (
    node.type === 'VariableDeclarator' && node.id.type === 'Identifier'
  ) {
    node.id.name += ': StyledComponentClass<any, {}>'
  }
}

/**
 *
 */
function addStyledComponentClassRef (node: babelTypes.ImportDeclaration) {
  const {ast} = babel.transform(`
    import {StyledComponentClass} from 'styled-components'
  `)
  const specifier = (<babelTypes.ImportDeclaration>(<babelTypes.File>ast).program.body[0]).specifiers[0]
  for (let i in node.specifiers) {
    const s = node.specifiers[i]
    if (s.type === 'ImportSpecifier' && s.imported.name === 'StyledComponentClass') {
      return // skip insert `StyledComponentClass`
    }
  }
  node.specifiers.push(specifier)
}

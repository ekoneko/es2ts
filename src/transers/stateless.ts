import * as babel from 'babel-core'
import * as types from 'babel-types'
import traverse, {NodePath} from 'babel-traverse'
import {getComponentLabel, IGetComponentLabel} from '../utils'

/**
 * Add declare for implicite static varible
 */
export default function (ast: types.File, content: string) {
  traverse(ast, {
    enter(path) {
      // ReturnStatement -> BlockStatement -> FunctionDeclaration
      // ReturnStatement -> BlockStatement -> ArrowFunctionExpression
      // ReturnStatement -> BlockStatement -> FunctionExpression
      if (path.isJSXElement()) {
        if (
          !path.parentPath.isReturnStatement() ||
          !path.parentPath.parentPath.isBlockStatement()
        ) return

        const declarePath = path.parentPath.parentPath.parentPath

        if (declarePath.isFunctionDeclaration()) {
          const id = declarePath.get('id')
          if (!id.isIdentifier()) return
          const name = (<types.Identifier>id.node).name

          insertPropTypes(name, <any>declarePath)
        }
        if (declarePath.isArrowFunctionExpression()) {
          parseFunctionExpression(declarePath, getComponentLabel(ast))
        }
        if (declarePath.isFunctionExpression()) {
          parseFunctionExpression(declarePath, getComponentLabel(ast))
        }
      }
    }
  })
}

function parseFunctionExpression(
  declarePath: NodePath,/*<types.ArrowFunctionExpression | types.FunctionExpression>*/
  componentLabel: IGetComponentLabel
) {
  const parentPath = <NodePath<types.VariableDeclarator>>declarePath.parentPath
  if (!parentPath.isVariableDeclarator()) return

  const id = parentPath.get('id')
  if (!id.isIdentifier()) return
  const idNode = <types.Identifier>id.node
  const name = idNode.name
  idNode.name += `: ${componentLabel.stateLessLabel}<I${name}Props>`

  const declarationPath = <NodePath<types.VariableDeclaration>>parentPath.parentPath
  insertPropTypes(name, declarationPath)
}

function insertPropTypes(
  compName: string,
  outterPath: NodePath<types.VariableDeclaration | types.FunctionDeclaration>
) {
  const interfaceAST = <types.File>babel.transform(`
    interface I${compName}Props {
      [key: string]: string
    }
  `, {
    plugins: ["syntax-typescript"]
  }).ast

  outterPath.insertBefore(interfaceAST.program.body)
}

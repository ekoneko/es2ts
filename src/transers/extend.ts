import * as babel from 'babel-core'
import { NodePath } from 'babel-traverse'
import * as types from 'babel-types'
import {getComponentLabel, IGetComponentLabel} from '../utils'
import AbstractTranser from './Abstract'

/**
 * Transform `class Name extends Component` to `class Name extends Component<NameProps, NameState>`
 */
export default class Extend extends AbstractTranser {
  exec(path: NodePath, ast: types.File, content: string) {
    const { node } = path
    if (!types.isClassDeclaration(node) && !types.isClassExpression(node)) return
    const className = node.id ? node.id.name : ''

    transformSuperClass(node.superClass, getComponentLabel(ast), className)

    const interfaceAST = <types.File>babel.transform(`
      interface I${className}Props {
        [key: string]: any
      }
      interface I${className}State {
        [key: string]: any
      }
    `, {
      plugins: ["syntax-typescript"]
    }).ast

    const insertPath = getInsertableParent(path)
    insertPath.insertBefore(interfaceAST.program.body)
  }
}

function transformSuperClass (node: types.Expression, componentLabel: IGetComponentLabel, className: string): boolean {
  const {comopnentLabel, pureComponentLabel} = componentLabel
  if (types.isIdentifier(node)) {
    if ([comopnentLabel, pureComponentLabel].indexOf(node.name) > -1) {
      node.name += `<I${className}Props, I${className}State>`;
    }
    return true
  }
  if (types.isMemberExpression(node)) {
    const object = <types.Identifier>node.object
    const property = <types.Identifier>node.property

    const name = object.name + '.' + property.name
    if ([comopnentLabel, pureComponentLabel].indexOf(name) > -1) {
      property.name += `<I${className}Props, I${className}State>`
    }
    return true
  }
  return false
}

// NOTE: ClassDeclaration may be decorated by export.
// ClassExpression may be wrapper with function
// Maybe it has a better way to find the insertable parent?
function getInsertableParent(path) {
  if (!path.parentPath) return null
  if (
    types.isExportDefaultDeclaration(path.parentPath) ||
    types.isExportNamedDeclaration(path.parentPath) ||
    types.isCallExpression(path.parentPath)
  ) {
    return getInsertableParent(path.parentPath)
  }
  return path
}

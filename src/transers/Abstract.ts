import * as types from 'babel-types'
import { NodePath } from 'babel-traverse'

export interface TranserInterface {
  before: (ast: types.File, content: string) => void
  after: (ast: types.File, content: string) => void
  exec: (path: NodePath, ast: types.File, content: string) => void
}

export default abstract class AbstractTranser implements TranserInterface {
  before(ast: types.File, content: string) {}
  after(ast: types.File, content: string) {}
  exec(path: NodePath, ast: types.File, content: string) {}
}

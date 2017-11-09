
import * as fs from 'fs'
import * as path from 'path'
import { promisify }  from 'util'
import { includeJSX, getAST } from './utils'
import * as babel from 'babel-core'
import * as babelTypes from 'babel-types'
import babelGenerator from 'babel-generator'
import * as glob from 'glob'

import extendTranser from './transers/extend'
import implicitStaticVarible from './transers/implicitStaticVarible'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

/**
 * Transform input .js file (es6+) to .ts
 * if the input file include some jsx, it will output a tsx file
 */

export async function transformFile (src: string, dist?: string) {
  console.log('transform file start', src);
  const code = (await readFileAsync(src)).toString()

  try {
    const { content, ast } = transformContent(code)
    const isJSX = () => includeJSX(ast)
    const distTarget = getDistPath(src, dist, isJSX)
    await writeFileAsync(distTarget, content)
  } catch (e) {
    console.error('[error(transform)]:', e)
  }
}

export async function transformDir (src: string, dist?: string, options?: any) {
  const files = glob.sync(path.join(src, '**/*.js*'), options)
  for (let i in files) {
    try {
      await transformFile(files[i])
    } catch (e) {
      console.error('[error]:', files[i], e)
    }
  }
}

export default function transformContent (content: string) {
  const ast = getAST(content)

  // transform content
  const nextContent = transform(ast, content)

  return {
    content: nextContent,
    ast,
  }
}

function getDistPath (src: string, dist: string|void, isJSX: () => boolean) {
  const fileName = path.basename(src)
  if (dist && dist.match(/\.tsx?$/)) {
    return dist
  }
  const distPath = dist || path.dirname(src)
  const distName = fileName.replace(/\.jsx?/, isJSX() ? '.tsx' : '.ts')
  return path.resolve(distPath, distName)
}

function transform (ast: babelTypes.File, content: string): string {
  extendTranser(ast, content)
  implicitStaticVarible(ast, content)

  const {code} = babelGenerator(ast, {}, content)
  return code
}
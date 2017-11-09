import * as babel from 'babel-core'
import traverse from 'babel-traverse'
import * as babelTypes from 'babel-types'

/**
 * Transform `class Name extends Component` to `class Name extends Component<NameProps, NameState>`
 */
export default function (ast: babelTypes.File, content: string) {
  const {comopnentLabel, pureComponentLabel} = getComponentLabel(ast)

  for (let i = 0; i < ast.program.body.length; i++) {
    let node = ast.program.body[i]
    if (node.type === 'ExportDefaultDeclaration') {
      node = <any>node.declaration
    }
    if (node.type !== 'ClassDeclaration') continue
    const className = node.id.name
    if ([comopnentLabel, pureComponentLabel].indexOf((<any>node.superClass).name) > -1) {
      (<any>node.superClass).name += `<I${className}Props, I${className}State>`;
    }

    const {ast: interfaceAST} = babel.transform(`
      interface I${className}Props {
        [key: string]: any
      }
      interface I${className}State {
        [key: string]: any
      }
    `, {
      plugins: ["syntax-typescript"]
    });

    ast.program.body.splice(i, 0, ...(<babelTypes.File>interfaceAST).program.body)
    i += ast.program.body.length
  }
}

interface IGetComponentLabel {
  reactLabel: string;
  comopnentLabel: string;
  pureComponentLabel: string;
}

/**
 * get `component` label
 * Component keyword come from react import declaration, look like:
 *   import React, {Comopnent, PureComponent} from 'react'
 * or use React.Component / React.PureComponent directly.
 */
function getComponentLabel (ast: babelTypes.File): IGetComponentLabel {
  let reactLabel = 'React'
  let comopnentLabel = ''
  let pureComponentLabel = ''
  ast.program.body.forEach(node => {
    if (node.type === 'ImportDeclaration' && node.source.value === 'react') {
      node.specifiers.forEach(s => {
        if (s.type === 'ImportDefaultSpecifier') {
          reactLabel = s.local.name
        } else if (s.type === 'ImportSpecifier') {
          if (s.imported.name === 'Component') {
            comopnentLabel = s.local.name
          } else if (s.imported.name === 'PureComponent') {
            pureComponentLabel = s.local.name
          }
        }
      })
    }
  })
  return {
    reactLabel,
    comopnentLabel: comopnentLabel || `${reactLabel}.Component`,
    pureComponentLabel: pureComponentLabel || `${reactLabel}.PureComponent`,
  }
}
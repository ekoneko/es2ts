import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import extend from '../extend'

const prefixs = [
  '',
  'export ',
  'export default '
]

const codeTemplate = `
import React, { PureComponent } from 'react';
class Tile extends PureComponent {
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
`.trim()

const resultTemplate = `
import React, { PureComponent } from 'react';
interface ITileProps {
  [key: string]: any;
}
interface ITileState {
  [key: string]: any;
}
class Tile extends PureComponent<ITileProps, ITileState> {
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
`.trim()

const cases = {}
prefixs.map(pre => {
  cases[pre||'default'] = {
    code: codeTemplate.replace('class ', `${pre}class `),
    result: resultTemplate.replace('class ', `${pre}class `)
  }
})

function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('extends transform', () => {
  for (let i in cases) {
    const { code, result } = cases[i]
    const ast = getAST(code)
    extend(ast, code)
    const {code: generateCode} = babelGenerator(ast, {}, code)
    it(i, () => {
      expect(format(generateCode) === result).toBeTruthy()
    })
  }
})

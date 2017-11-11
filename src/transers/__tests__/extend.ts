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

const code1 = `
import React from 'react';
class Tile extends React.PureComponent {
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
class B extends React.PureComponent {
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
`.trim()

const result1 = `
import React from 'react';
interface ITileProps {
  [key: string]: any;
}
interface ITileState {
  [key: string]: any;
}
class Tile extends React.PureComponent<ITileProps, ITileState> {
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
interface IBProps {
  [key: string]: any;
}
interface IBState {
  [key: string]: any;
}
class B extends React.PureComponent<IBProps, IBState> {
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
      expect(format(generateCode)).toBe(result)
    })
  }

  it('react.Component', () => {
    const ast = getAST(code1)
    extend(ast, code1)
    const {code: generateCode} = babelGenerator(ast, {}, code1)
    expect(format(generateCode)).toBe(result1)
  })
})

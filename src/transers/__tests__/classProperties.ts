import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import classProperties from '../classProperties'

const code = `
import React, { PureComponent } from 'react';
class Tile extends PureComponent {
  private tail
  update() {}
  render() {
    this.update()
    const content = this.title + this.content + this.tail;
    return <div>{this.title}{content}</div>;
  }
}
`.trim()

const result = `
import React, { PureComponent } from 'react';
class Tile extends PureComponent {
  private title: any;
  private content: any;
  private tail;
  update() {}
  render() {
    this.update();
    const content = this.title + this.content + this.tail;
    return <div>{this.title}{content}</div>;
  }
}
`.trim()

function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('class properties transform', () => {
  const ast = getAST(code)
  classProperties(ast, code)
  const {code: generateCode} = babelGenerator(ast, {}, code)

  it ('default', () => {
    expect(format(generateCode)).toBe(result)
  })
})

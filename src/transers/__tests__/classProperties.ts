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

const code1 = `
import React, { PureComponent } from 'react';
withWrapper(
  class Tile extends PureComponent {
    private tail
    update() {}
    render() {
      this.update()
      const content = this.title + this.content + this.tail;
      return <div>{this.title}{content}</div>;
    }
  }
)
`.trim()

const result1 = `
import React, { PureComponent } from 'react';
withWrapper(class Tile extends PureComponent {
  private title: any;
  private content: any;
  private tail;
  update() {}
  render() {
    this.update();
    const content = this.title + this.content + this.tail;
    return <div>{this.title}{content}</div>;
  }
});
`.trim()

function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('class properties transform', () => {
  it ('default', () => {
    const ast = getAST(code)
    classProperties(ast, code)
    const {code: generateCode} = babelGenerator(ast, {}, code)
    expect(format(generateCode)).toBe(result)
  })

  it ('with wrapper', () => {
    const ast = getAST(code1)
    classProperties(ast, code1)
    const {code: generateCode} = babelGenerator(ast, {}, code1)
    expect(format(generateCode)).toBe(result1)
  })
})

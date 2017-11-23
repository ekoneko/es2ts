import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import stateless from '../stateless'

const code1 = `
import React from 'react'
const CompA = function(props) {
  return <div>{props.children}</div>
}
`.trim()

const result1 = `
import React from 'react';
interface ICompAProps {
  [key: string]: string;
}
const CompA: React.Stateless<ICompAProps> = function (props) {
  return <div>{props.children}</div>;
};
`.trim()

const code2 = `
import React from 'react'
const CompB = ({children}) => {
  return <div>{children}</div>
}
`.trim()
const result2 = `
import React from 'react';
interface ICompBProps {
  [key: string]: string;
}
const CompB: React.Stateless<ICompBProps> = ({
  children
}) => {
  return <div>{children}</div>;
};
`.trim()

function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('stateless transform', () => {
  it ('A', () => {
    const ast = getAST(code1)
    stateless(ast, code1)
    const generateCode = babelGenerator(ast, {}, code1).code
    expect(format(generateCode)).toBe(result1)
  })
  it ('B', () => {
    const ast = getAST(code2)
    stateless(ast, code2)
    const generateCode = babelGenerator(ast, {}, code2).code
    expect(format(generateCode)).toBe(result2)
  })
  // it ('C', () => {
  //   const ast = getAST(code3)
  //   stateless(ast, code3)
  //   const generateCode = babelGenerator(ast, {}, code3).code
  //   expect(format(generateCode)).toBe(result3)
  // })
})

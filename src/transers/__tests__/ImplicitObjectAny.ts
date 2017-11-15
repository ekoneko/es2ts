import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import ImplicitObjectAny from '../ImplicitObjectAny'

const code = `
const a = {}
let b
b = {}
const { c } = o
const d = { params: {}}
e > {}
function f (a = {}) {
  a.b = 1
}
`.trim()

const result = `
const a: any = {};
let b;
b = {};
const {
  c
} = o;
const d = {
  params: {}
};
e > {};
function f(a: any = {}) {
  a.b = 1;
}
`.trim()

function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('implicit object any', () => {
  it('default', () => {
    const ast = getAST(code)
    ImplicitObjectAny(ast, code)
    const {code: generateCode} = babelGenerator(ast, {}, code)
    expect(format(generateCode)).toBe(result)
  })
})

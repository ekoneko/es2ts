import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import StyleComponents from '../styleComponents'
import { transformPartial } from '../../transform'

const styleComponents = transformPartial(StyleComponents)

const code = `
import styled from 'styled-components';
const Title = styled.p\`
  width: 100%;
  position: absolute;
  top: \${props => props.top}px;
  left: \${props => props.left}px;
\`
`.trim()

const result = `
import styled, { StyledComponentClass } from 'styled-components';
const Title: StyledComponentClass<any, {}> = styled.p\`
  width: 100%;
  position: absolute;
  top: \${(props: any) => props.top}px;
  left: \${(props: any) => props.left}px;
\`;
`.trim()

const code1 = `
import styled, { StyledComponentClass } from 'styled-components';
const A = styled.a.attrs({
  href: '#'
})\`
  display: block;
  top: \${props => props.top}px;
\`
`.trim()

const result1 = `
import styled, { StyledComponentClass } from 'styled-components';
const A: StyledComponentClass<any, {}> = styled.a.attrs({
  href: '#'
})\`
  display: block;
  top: \${(props: any) => props.top}px;
\`;
`.trim()


function format (content) {
  return content.split(/[\r\n]/).filter(Boolean).join('\n')
}

describe('class properties transform', () => {
  it ('default', () => {
    const ast = getAST(code)
    styleComponents(ast, code)
    const {code: generateCode} = babelGenerator(ast, {}, code)
    expect(format(generateCode)).toBe(result)
  })

  it ('attr', () => {
    const ast = getAST(code1)
    styleComponents(ast, code1)
    const {code: generateCode} = babelGenerator(ast, {}, code1)
    expect(format(generateCode)).toBe(result1)
  })
})

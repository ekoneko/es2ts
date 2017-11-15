import babelGenerator from 'babel-generator'
import {getAST} from '../../utils'
import implicitStaticVarible from '../implicitStaticVarible'

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
Tile.propTypes = {
  draggable: PropTypes.bool
};
`.trim()

const resultTemplate = `
import React, { PureComponent } from 'react';
class Tile extends PureComponent {
  static propTypes;
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
}
Tile.propTypes = {
  draggable: PropTypes.bool
};
`.trim()

const code1 = `
import React, { PureComponent } from 'react';
withWrapper(
  class Tile extends PureComponent {
    render() {
      return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
    }
  }
);
class B {}
B.displayName = 'ClassB'
Tile.propTypes = {
  draggable: PropTypes.bool
};
`.trim()

const result1 = `
import React, { PureComponent } from 'react';
withWrapper(class Tile extends PureComponent {
  static propTypes;
  render() {
    return this.props.draggable ? <DndFileTile {...this.props} /> : <StyledFileTile {...this.props} />;
  }
});
class B {
  static displayName;
}
B.displayName = 'ClassB';
Tile.propTypes = {
  draggable: PropTypes.bool
};
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
    implicitStaticVarible(ast, code)
    const {code: generateCode} = babelGenerator(ast, {}, code)
    it(i, () => {
      expect(format(generateCode)).toBe(result)
    })

    it ('with wrapper', () => {
      const ast = getAST(code1)
      implicitStaticVarible(ast, code1)
      const generateCode = babelGenerator(ast, {}, code1).code
      expect(format(generateCode)).toBe(result1)
    })
  }
})

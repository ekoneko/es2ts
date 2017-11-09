import { includeJSX } from '../utils'

const jsWithoutJSX = `
  function func () {
    const a = 1
    const b = 2
    return a < b
  }
`

const jsWithJSX = `
import React from 'react'

class Comp extends React.Component {
  render() {
    return <div></div>
  }
}
`

describe('is jsx', () => {
  it ('without jsx', () => {
    expect(includeJSX(jsWithoutJSX)).toBeFalsy()
  })
  it ('with jsx', () => {
    expect(includeJSX(jsWithJSX)).toBeTruthy()
  })
})

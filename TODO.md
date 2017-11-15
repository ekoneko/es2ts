3. transform below:
````js
const o = {}  // should declare `any`
o.a = 1
o.b = 2
````

4. styled-components like this
````js
const Base =  = styled.div`
  // ...
`

const Child = Base.withComponent('div').extend`
  // ...
`
````

5. stateless (function) components declare

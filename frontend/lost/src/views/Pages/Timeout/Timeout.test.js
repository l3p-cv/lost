import React from 'react'
import ReactDOM from 'react-dom'
import Timeout from './Timeout'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Timeout />, div)
  ReactDOM.unmountComponentAtNode(div)
})

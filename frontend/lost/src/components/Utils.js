import React from 'react'
import namor from 'namor'
import './index.css'


const range = len => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newLabelTree = () => {
  return {
    name: namor.generate({ words: 1, numbers: 0 }),
    description: namor.generate({ words: 3, numbers: 0 }),
    group: namor.generate({ words: 1, numbers: 5 })
  }
}
const newLabel = () => {
  return {
    name: namor.generate({ words: 1, numbers: 0 }),
    description: namor.generate({ words: 3, numbers: 0 }),
    leafId: Math.floor(Math.random() * 30)
  }
}


export function makeData(len = 10) {
  return range(len).map(d => {
    return {
      ...newLabelTree(),
      children: range(10).map(newLabel) // []
    }
  })
}


export const Tips = () =>
  <div style={{ textAlign: 'center' }}>
    <em>Tip: Right click on a Tree or Label in order to add or edit elements.</em>
  </div>

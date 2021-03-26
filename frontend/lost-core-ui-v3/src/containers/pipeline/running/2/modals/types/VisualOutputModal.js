import React, { Component } from 'react'
import { ModalHeader, ModalBody } from 'reactstrap';
import actions from '../../../../../../actions/pipeline/pipelineRunning'

import { connect } from 'react-redux'
import { Card } from 'reactstrap'
const { downloadImage } = actions
class VisualOutputModal extends Component {
  constructor() {
    super()
    this.state = {
      items: []
    }
  }

  async componentDidMount() {
    const arr = this.props.visualOutput.map((el) => {
      return this.props.downloadImage(el.imagePath)
    })
    Promise.all(arr).then(images => {
      let itemsArr = []
      images.forEach((el, i) => {
        itemsArr.push({
          url: el,
          html: this.props.visualOutput[i].htmlOutput
        })
      })
      this.setState({
        items: itemsArr
      })
    })

  }
  render() {
    return (
      <>
        <ModalHeader>VisualOutput Modal</ModalHeader>
        <ModalBody>
          {this.state.items.map((el) => {
            return (
              <Card>
                <div style={{ textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: el.html }} />
                <img style={{ padding: '15px' }} width='100%' height='auto' alt='noImage' src={el.url}></img>
              </Card>
            )
          })}
        </ModalBody>
      </>
    )
  }
}

export default connect(null, { downloadImage })(VisualOutputModal)
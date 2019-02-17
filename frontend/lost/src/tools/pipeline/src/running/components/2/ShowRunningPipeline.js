import React, {Component} from 'react'
import * as http from '../../../http'
import Modals from './modal'
import testData from './testData'
class SelectPipeline extends Component{
    constructor(){
        super()
        this.state = {
            modalOpen: false
        }
        this.openModal = this.openModal.bind(this)
        this.toggleModal = this.toggleModal.bind(this)

    }
    componentDidMount(){
        this.setState({data: testData})

    }
    openModal(){
        this.setState({
            selectedModal: 1
        })
        this.toggleModal()
    }

    renderModals(){
        if(this.state){
            return (
                <Modals
                    data = {this.state.data}
                    selectedModal = {this.state.selectedModal}
                    toggleModal = {this.toggleModal}
                    modalOpen= {this.state.modalOpen}
                />
            )
        }
    }

    toggleModal(){
        this.setState({modalOpen: !this.state.modalOpen})
    }
    render(){
        return (
            <div>
                <button onClick={this.openModal}>Open Datasource Modal</button>


                {this.renderModals()}

            </div>
        )
    }
}

export default SelectPipeline







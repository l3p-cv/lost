import React, {Component} from 'react'
import actions from 'actions/pipeline/pipelineStartModals/annoTask'
import {connect} from 'react-redux'
const {selectLabelTree} = actions
import {Card, CardBody} from 'reactstrap'

class SelectTree extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }

    selectRow(e){
        this.props.selectLabelTree(
            this.props.peN, 
            e.currentTarget.getAttribute('id'))
        this.props.verifyTab(this.props.peN, 2, true)
        this.props.selectTab(this.props.peN, 3)
        
    }


    renderTable(){
        return this.props.availableLabelTrees.map((el)=>{
            return(
                <div key={el.idx} id={el.idx} onClick={this.selectRow}>{el.name}</div>
            )
        })
    }
    render(){
        return(
            <Card className='annotask-modal-card'>
            <CardBody>
                {this.renderTable()}
                </CardBody>
                </Card>
        )
    }
}

export default connect(null, {selectLabelTree})(SelectTree)
import React, {Component} from 'react'
import actions from 'actions/pipeline/pipelineStartModals/annoTask'
import { connect } from 'react-redux';
const {selectUser, selectLabelTree} = actions
class SelectUser extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }

    selectRow(e){
        this.props.selectUser(
            this.props.peN, 
            e.currentTarget.getAttribute('name'),
            e.currentTarget.getAttribute('id'))
        this.props.verifyTab(this.props.peN, 1, true)
        
    }


    renderTable(){
        return this.props.availableGroups.map((el)=>{
            return(
                <div id={el.id} name={el.groupName} onClick={this.selectRow}>{el.groupName}</div>
            )
        })
    }
    render(){
        return(
            <div>
                {this.renderTable()}
            </div>
        )
    }
}

export default connect(null, {selectUser, selectLabelTree})(SelectUser)
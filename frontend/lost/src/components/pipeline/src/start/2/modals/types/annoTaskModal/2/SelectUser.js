import React, {Component} from 'react'
import actions from 'actions/pipeline/pipelineStartModals/annoTask'
import { connect } from 'react-redux';
import {Card, CardBody} from 'reactstrap'
import ReactTable from 'react-table'
const {selectUser} = actions
class SelectUser extends Component{
    constructor(){
        super()
        this.selectRow = this.selectRow.bind(this)
    }

    selectRow(row){
        this.props.selectUser(
            this.props.peN, 
            row.groupName,
            row.id)
        this.props.verifyTab(this.props.peN, 1, true)
        this.props.selectTab(this.props.peN, 2)
        
    }


    renderTable(){
        console.log('----------2--------------------------');
        console.log(this.props);
        console.log('------------------------------------');
        // return this.props.availableGroups.map((el)=>{
        //     // return(
        //     //     <div key={el.id} id={el.id} name={el.groupName} onClick={this.selectRow}>{el.groupName}</div>
        //     // )
        // })
        return (
        <ReactTable
        columns={[
            {
                Header: "ID",
                accessor: "id"
            },
            {
                Header: "Name",
                accessor: "groupName"
            }
        ]}
        getTrProps={(state, rowInfo) => ({
            onClick: () => this.selectRow(rowInfo.original)
        })}
        defaultSorted={[
            {
                id: "name",
                desc: true
            }
        ]}
        data={this.props.availableGroups}
        defaultPageSize={10}
        className="-striped -highlight"
    />)


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

export default connect(null, {selectUser})(SelectUser)
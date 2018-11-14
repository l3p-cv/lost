import React, {Component } from 'react'
import {connect} from 'react-redux'
import GroupContextMenu from './GroupContextMenu';

class GroupList extends Component{

    render(){
        return(
            <div>
            {this.props.groups.map((g)=>{return(
                <div key={g.name}>
                {g.name}  <GroupContextMenu groupId={g.idx}/>
                </div>
                )})}
            </div>
        )
    }
}

function mapStateToProps(state){
    return({groups: state.group.groups})
}

export default connect(mapStateToProps)(GroupList)
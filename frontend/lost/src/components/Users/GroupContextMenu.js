import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {Menu, Item, contextMenu} from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'

const {deleteGroup, getUsers} = actions
class GroupContextMenu extends Component {
    constructor(props) {
        super(props)
        this.handleContextMenu = this
            .handleContextMenu
            .bind(this);
        this.state = {
            menuId: 'group_menu_' + this.props.groupId
        }

    }
    handleContextMenu(e) {
        // always prevent default behavior
        e.preventDefault();
        // Don't forget to pass the id and the event and voila!
        contextMenu.show({id: this.state.menuId, event: e});
    }


    render() {
        return (
            <div
                onClick={(e) => this.handleContextMenu(e)}
                style={{
                cursor: 'pointer'
            }}>
                <center>
                    <i className='icon-options-vertical icons font-1xl '></i>
                </center>
                <Menu id={this.state.menuId}>
                    <Item onClick={() => this.props.deleteGroup(this.props.getUsers, this.props.groupId)}>
                        <span>
                            <i className='fa fa-trash fa-lg'></i> Delete Group
                        </span>
                    </Item>
                </Menu>
            </div>
        )
    }
}

export default connect(null, {deleteGroup, getUsers})(GroupContextMenu)

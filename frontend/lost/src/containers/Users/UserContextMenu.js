import React, {Component} from 'react'
import {connect} from 'react-redux'
import actions from '../../actions'
import {Menu, Item, contextMenu} from 'react-contexify'
import 'react-contexify/dist/ReactContexify.min.css'

const {deleteUser} = actions
class UserContextMenu extends Component {
    constructor(props) {
        super(props)
        this.handleContextMenu = this
            .handleContextMenu
            .bind(this);
        this.state = {
            menuId: 'user_menu_' + this.props.userId
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
                    <i className='icon-options-vertical icons font-xl'></i>
                </center>
                <Menu id={this.state.menuId}>
                    <Item onClick={() => this.props.deleteUser(this.props.userId)}>
                        <span>
                            <i className='fa fa-trash fa-lg'></i>
                            Delete User
                        </span>
                    </Item>
                </Menu>
            </div>
        )
    }
}
function mapStateToProps(state){
    return {deleteMessage: state.user.deleteMessage}
}
export default connect(mapStateToProps, {deleteUser})(UserContextMenu)

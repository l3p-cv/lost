import React, {Component} from 'react'
import {connect} from 'react-redux'
import GroupContextMenu from './GroupContextMenu'
import {Row, Col} from 'reactstrap'
import {NotificationManager, NotificationContainer} from 'react-notifications'
import 'react-notifications/lib/notifications.css';
import actions from '../../actions'

const {cleanGroupDeleteMessage} = actions

class GroupList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            clickedGroup: null
        }
    }
    componentDidUpdate() {
        if (this.props.deleteMessage === 'success') {
            NotificationManager.success(`Group with id ${this.state.clickedGroup} deleted.`)
        } else if (this.props.deleteMessage !== '') {
            NotificationManager.error(this.props.deleteMessage)
        }
        this
            .props
            .cleanGroupDeleteMessage()
    }


    render() {
        return (
            <div style={{
                margin: '15px 0 20px 5px'
            }}>
                {this
                    .props
                    .groups
                    .map((g) => {
                        return (
                            <Row
                                key={g.name}
                                style={{
                                margin: '10px 0 0 0'
                            }}
                                onClick={() =>  this.setState({clickedGroup: g.idx})}>
                                <Col xs='6' sm='6' lg='9'>
                                    <div>
                                        {g.name}
                                    </div>
                                </Col>
                                <Col xs='6' sm='6' lg='3'>
                                    <GroupContextMenu groupId={g.idx}/>
                                </Col>
                            </Row>
                        )
                    })}
                <NotificationContainer/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({groups: state.group.groups, deleteMessage: state.group.deleteMessage})
}

export default connect(mapStateToProps, {cleanGroupDeleteMessage})(GroupList)
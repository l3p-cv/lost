import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import { Input, InputGroup, InputGroupAddon } from 'reactstrap'
import IconButton from '../../components/IconButton'
import { NotificationManager, NotificationContainer } from 'react-notifications'

import 'react-notifications/lib/notifications.css'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const { cleanLabelMessages, createLabelTree } = actions

class CreateLabelTree extends Component {
    constructor(props) {
        super(props)
        this.state = {
            createLabelname: '',
            createLabeldescription: '',
            createLabelabbreviation: '',
            createLabelextID: '',
        }

        this.handleCreateLabelName = this.handleCreateLabelName.bind(this)
        this.handleCreateLabelDescription = this.handleCreateLabelDescription.bind(this)
        this.handleCreateSave = this.handleCreateSave.bind(this)
    }
    handleCreateLabelName(e) {
        this.setState({ createLabelname: e.target.value })
    }
    handleCreateLabelDescription(e) {
        this.setState({ createLabeldescription: e.target.value })
    }

    handleCreateSave(e) {
        const saveData = {
            is_root: true,
            name: this.state.createLabelname,
            description: this.state.createLabeldescription,
            abbreviation: this.state.createLabelabbreviation,
            external_id: this.state.createLabelextID,
            parent_leaf_id: this.state.editLabelid,
        }
        this.props.createLabelTree(saveData, this.props.visLevel)
    }

    componentDidUpdate() {
        if (this.props.createMessage === 'success') {
            NotificationManager.success(`LabelTree created.`)
        } else if (this.props.createMessage !== '') {
            NotificationManager.error(this.props.createMessage)
        }
        this.props.cleanLabelMessages()
    }
    render() {
        return (
            <>
                <InputGroup style={{ marginBottom: '10px', marginTop: '10px' }}>
                    <Input
                        type="text"
                        placeholder="name"
                        value={this.state.createLabelname}
                        onChange={this.handleCreateLabelName}
                    ></Input>
                    <Input
                        type="text"
                        placeholder="description"
                        value={this.state.createLabeldescription}
                        onChange={this.handleCreateLabelDescription}
                    ></Input>
                    <InputGroupAddon addonType="append">
                        <IconButton
                            color="primary"
                            onClick={this.handleCreateSave}
                            icon={faPlus}
                            text="Add"
                        />
                    </InputGroupAddon>
                </InputGroup>
                <NotificationContainer />
            </>
        )
    }
}

function mapStateToProps(state) {
    return { createMessage: state.label.createLabelTreeMessage }
}

export default connect(mapStateToProps, { cleanLabelMessages, createLabelTree })(
    CreateLabelTree,
)

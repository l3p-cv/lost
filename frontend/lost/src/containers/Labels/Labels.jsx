import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import LabelTreeTable from './LabelTreeTable'
import CreateLabelTree from './CreateLabelTree'

const { getLabelTrees } = actions

class Label extends Component {
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
        return (
            <>
                <CreateLabelTree />
                <LabelTreeTable labelTrees={this.props.trees}></LabelTreeTable>
            </>
        )
    }
}

function mapStateToProps(state) {
    return { trees: state.label.trees }
}

export default connect(mapStateToProps, { getLabelTrees })(Label)

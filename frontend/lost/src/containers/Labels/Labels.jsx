import React, { Component } from 'react'
import { connect } from 'react-redux'
import actions from '../../actions'
import { CardHeader, Card, CardBody, Col, Row } from 'reactstrap'
import LabelTreeTable from './LabelTreeTable'
import LabelTree from './LabelTree'
import CreateLabelTree from './CreateLabelTree'

const { getLabelTrees } = actions

class Label extends Component {
    constructor(props) {
        super(props)
        this.selectTree = this.selectTree.bind(this)
        this.state = {
            selectedTreeId: null,
        }
    }

    selectTree(id) {
        this.setState({ selectedTreeId: id })
    }
    componentDidMount() {
        this.props.getLabelTrees()
    }
    render() {
        return (
            <>
                <hr />
                <CreateLabelTree />
                <hr />
                <LabelTreeTable
                    labelTrees={this.props.trees}
                    callback={this.selectTree}
                ></LabelTreeTable>
                <hr />
                <LabelTree
                    labelTree={this.props.trees[this.state.selectedTreeId]}
                ></LabelTree>
                <hr />
            </>
        )
    }
}

function mapStateToProps(state) {
    return { trees: state.label.trees }
}

export default connect(mapStateToProps, { getLabelTrees })(Label)

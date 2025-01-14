import React, { Component } from 'react'
import EditLabel from './EditLabel'
import LabelsPage from './LabelsPage'

const options = {
    autoResize: true,
    height: '600px',
    layout: {
        hierarchical: {
            enabled: true,
            sortMethod: 'directed',
        },
    },
    edges: {
        color: '#000000',
    },
    physics: {
        enabled: false,
    },
    nodes: {
        color: {
            border: '#00FF00',
            background: '#10515F',
            highlight: {
                border: '#00FF00',
                background: '#D2E5FF',
            },
            hover: {
                border: '#00FF00',
                background: '#D2E5FF',
            },
        },
    },
}

class LabelTree extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedLabel: null,
        }
        this.selectLabel = this.selectLabel.bind(this)
        this.clearSelectedLabel = this.clearSelectedLabel.bind(this)
    }
    selectLabel(id) {
        if (id) {
            this.setState({
                selectedLabel: findNode(id, this.props.labelTree),
            })
        }
    }
    clearSelectedLabel() {
        this.setState({
            selectedLabel: null,
        })
    }
    renderEditLabel(tree) {
        if (!(tree.group_id === null ? this.props.visLevel !== 'global' : false))
            return (
                <EditLabel
                    label={this.state.selectedLabel}
                    clearSelectedLabel={this.clearSelectedLabel}
                    visLevel={this.props.visLevel}
                ></EditLabel>
            )
    }
    render() {
        const events = {
            select: (event) => this.selectLabel(event.nodes[0]),
        }
        const tree = this.props.labelTree
        if (tree) {
            return (
                <>
                    {this.renderEditLabel(tree)}
                    <LabelsPage
                        labelTree={this.props.labelTree}
                        visLevel={this.props.visLevel}
                    ></LabelsPage>
                    {/* <Graph  graph={graph} options={options} events={events} /> */}
                </>
            )
        } else {
            return <div>No Tree selected.</div>
        }
    }
}
function findNode(idx, currentNode) {
    var i, currentChild, result

    if (idx === currentNode.idx) {
        return currentNode
    } else {
        // Use a for loop instead of forEach to avoid nested functions Otherwise
        // "return" will not work properly
        for (i = 0; i < currentNode.children.length; i += 1) {
            currentChild = currentNode.children[i]

            // Search in the current child
            result = findNode(idx, currentChild)

            // Return the result if the node has been found
            if (result !== false) {
                return result
            }
        }

        // The node has not been found and we have no more options
        return false
    }
}

export default LabelTree

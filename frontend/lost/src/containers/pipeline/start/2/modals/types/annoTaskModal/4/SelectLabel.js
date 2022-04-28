import React, { Component } from 'react'
import Graph from 'react-graph-vis'
import { connect } from 'react-redux'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import HelpButton from '../../../../../../../../components/HelpButton'
import { CRow } from '@coreui/react'
import _ from 'lodash'

const { updateLabels } = actions

const options = {
    height: '600px',
    interaction: {
        dragNodes: false,
        dragView: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: false,
        hoverConnectedEdges: false,
        keyboard: {
            enabled: false,
            speed: { x: 10, y: 10, zoom: 0.02 },
            bindToWindow: true,
        },
        multiselect: false,
        selectable: true,
        selectConnectedEdges: false,
        tooltipDelay: 100,
        zoomView: true,
    },
    layout: {
        hierarchical: {
            enabled: true,
            sortMethod: 'directed',
        },
    },
    edges: {
        color: '#000000',
        chosen: false,
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

class SelectLabel extends Component {
    constructor() {
        super()
        this.events = {
            select: (event) => {
                if (this.graphData.isLeafArr.includes(event.nodes[0])) {
                    // leaf item clicked
                    this.selectionHandler()
                    return
                }
                const arr = event.nodes.map((el) => {
                    return {
                        id: el,
                        maxLabels: '3',
                    }
                })
                const isDoublicated =
                    this.props.labelLeaves.filter((el) => el.id === event.nodes[0])
                        .length > 0
                let editedArr
                if (isDoublicated) {
                    // deselect --> filter array
                    editedArr = this.props.labelLeaves.filter(
                        (el) => !(el.id === event.nodes[0]),
                    )
                } else {
                    // select --> merge arrays
                    editedArr = _.unionBy(arr, this.props.labelLeaves, 'id')
                }
                this.props.updateLabels(this.props.peN, editedArr)
                this.props.verifyTab(this.props.peN, 3, true)
                this.selectionHandler()
            },
        }
        this.graph = React.createRef()
    }

    selectionHandler() {
        this.selectedArr = this.props.labelLeaves.map((el) => el.id)
        this.selectChildrenArr = []
        const parentIsInList =
            this.selectedArr.filter((el) => el === this.tree.idx).length > 0
        if (parentIsInList) {
            this.selectChildrenArr = this.tree.children.map((el) => el.idx)
        }
        this.findChildren(this.tree)
        this.graph.current.Network.selectNodes(this.selectChildrenArr)
    }

    findChildren(branch) {
        branch.children.forEach((el) => {
            const isInList = this.selectedArr.filter((el2) => el2 === el.idx).length > 0
            if (isInList) {
                this.selectChildrenArr = [
                    ...this.selectChildrenArr,
                    ...el.children.map((el3) => el3.idx),
                ]
            }
            if (el.children.length) {
                this.findChildren(el)
            }
        })
    }

    componentDidMount() {
        this.selectionHandler()
    }

    mapTreeToGraph(branch, parent) {
        branch.children.forEach((el) => {
            if (parent) {
                this.graphData.edges.push({
                    from: parent,
                    to: el.idx,
                })
            }
            let nodeObj = {
                id: el.idx,
                label: String(el.name),
                color: el.color ? el.color : '#10515F',
                font: { color: '#FFFFFF' },
            }
            if (el.children.length) {
                this.mapTreeToGraph(el, el.idx)
            } else {
                this.graphData.isLeafArr.push(el.idx)
            }
            this.graphData.nodes.push(nodeObj)
        })
    }

    render() {
        this.graphData = {
            nodes: [],
            edges: [],
            isLeafArr: [],
        }
        this.tree = this.props.availableLabelTrees.filter(
            (el) => el.idx === this.props.selectedLabelTree,
        )[0]
        this.graphData.nodes.push({
            id: this.tree.idx,
            label: this.tree.name,
            chosen: true,
            color: this.tree.color ? this.tree.color : '#10515F',
            font: { color: '#FFFFFF' },
        })

        this.mapTreeToGraph(this.tree, this.tree.idx)

        return (
            // <Card className="annotask-modal-card">
            //     <CardBody>
            <>
                <CRow className="justify-content-center">
                    <HelpButton
                        id={'choose-label'}
                        text={`Click on the parent label to make all child labels available in the AnnotationTask. 
                        Multiple parent labels can also be selected. 
                        Labels that are active for the AnnotationTask are visualized with a strong border in this view.`}
                    />
                </CRow>
                <Graph
                    ref={this.graph}
                    graph={this.graphData}
                    options={options}
                    events={this.events}
                />
            </>
            //     </CardBody>
            // </Card>
        )
    }
}

const mapStateToProps = (state, test) => {
    const element = state.pipelineStart.step1Data.elements.filter(
        (el) => el.peN === test.peN,
    )[0]

    return {
        selectedLabelTree: element.exportData.annoTask.selectedLabelTree,
        labelLeaves: element.exportData.annoTask.labelLeaves,
    }
}
export default connect(mapStateToProps, { updateLabels })(SelectLabel)

import React, { useEffect, useRef, useState } from 'react'
import Graph from 'react-graph-vis'
import { useDispatch, useSelector } from 'react-redux'
import actions from '../../../../../../../../actions/pipeline/pipelineStartModals/annoTask'
import HelpButton from '../../../../../../../../components/HelpButton'
import { CRow } from '@coreui/react'
import _ from 'lodash'

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

let tree
let selectedArr
let selectChildrenArr = []

const SelectLabel = ({ availableLabelTrees, peN, verifyTab }) => {

    const { updateLabels } = actions
    const stateElement = useSelector((element) => element)
    const [labelLeaves, setLabelLeaves] = useState()
    const [selectedLabelTreeIndex, setSelectedLabelTreeIndex] = useState()
    const [graphData, setGraphData] = useState({
        nodes: [],
        edges: [],
        isLeafArr: [],
    })

    useEffect(() => {
        const element = stateElement.pipelineStart.step1Data.elements.filter(
            (el) => el.peN === peN,
        )[0]

        const _selectedLabelTreeIndex = element.exportData.annoTask.selectedLabelTree
        const _labelLeaves = element.exportData.annoTask.labelLeaves

        setSelectedLabelTreeIndex(_selectedLabelTreeIndex)
        setLabelLeaves(_labelLeaves)

    }, [stateElement, peN])

    const graphRef = useRef()

    const events = {
        select: (event) => {
            if (graphData.isLeafArr.includes(event.nodes[0])) {
                // leaf item clicked
                selectionHandler()
                return
            }

            const arr = event.nodes.map((el) => {
                return {
                    id: el,
                    maxLabels: '3',
                }
            })

            const isDuplicated =
                labelLeaves.filter((el) => el.id === event.nodes[0]).length > 0

            let editedArr

            if (isDuplicated) {
                // deselect --> filter array
                editedArr = labelLeaves.filter(
                    (el) => !(el.id === event.nodes[0]),
                )
            } else {
                // select --> merge arrays
                editedArr = _.unionBy(arr, labelLeaves, 'id')
            }

            updateLabels(peN, editedArr)
            verifyTab(peN, 3, true)
            selectionHandler()
        },
    }

    const findChildren = (branch) => {
        branch.children.forEach((el) => {
            const isInList = selectedArr.filter((el2) => el2 === el.idx).length > 0
            if (isInList) {
                selectChildrenArr = [
                    ...selectChildrenArr,
                    ...el.children.map((el3) => el3.idx),
                ]
            }

            if (el.children.length) findChildren(el)
        })
    }

    const selectionHandler = () => {
        selectedArr = labelLeaves.map((el) => el.id)
    }

    const mapTreeToGraph = (_graphData, branch, parent) => {
        branch.children.forEach((el) => {
            if (parent) {
                _graphData.edges.push({
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
                mapTreeToGraph(_graphData, el, el.idx)
            } else {
                _graphData.isLeafArr.push(el.idx)
            }

            _graphData.nodes.push(nodeObj)
        })

        setGraphData(_graphData)
    }

    useEffect(() => {
        if (labelLeaves === undefined) return

        selectionHandler()

        // get tree with selected index
        const _tree = availableLabelTrees.filter(
            (el) => el.idx === selectedLabelTreeIndex,
        )[0]

        tree = _tree

        const parentIsInList = selectedArr.filter((el) => el === tree.idx).length > 0
        if (parentIsInList) {
            console.log("Parent in list");
            selectChildrenArr = tree.children.map((el) => el.idx)
        }

        findChildren(tree)

        if (graphRef.current !== undefined) {
            console.info("SELECTING NODE")
            graphRef.current.Network.selectNodes(selectChildrenArr)
        }

        // copy graphData without reference to make useEffekt work
        const _graphData = { ...graphData }

        _graphData.nodes.push({
            id: tree.idx,
            label: tree.name,
            chosen: true,
            color: tree.color ? tree.color : '#10515F',
            font: { color: '#FFFFFF' },
        })

        mapTreeToGraph(_graphData, tree, tree.idx)
    }, [labelLeaves])

    if (graphData.nodes.length === 0) return 'Loading...'

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
                ref={graphRef}
                graph={graphData}
                options={options}
                events={events}
            />

        </>
        //     </CardBody>
        // </Card>
    )
}

export default SelectLabel

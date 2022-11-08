import React, { useEffect, useRef, useState } from 'react'
import Graph from 'react-graph-vis'
import { useSelector } from 'react-redux'
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

const SelectLabel = ({ availableLabelTrees, peN, verifyTab }) => {

    const { updateLabels } = actions
    const stateElement = useSelector((element) => element)
    const [selectedTree, setSelectedTree] = useState()
    const [selectedNodeIDs, setSelectedNodeIDs] = useState([])
    const [selectedLeaves, setSelectedLeaves] = useState([])
    const [selectedLabelTreeIndex, setSelectedLabelTreeIndex] = useState()
    const [graphNet, setGraphNet] = useState()
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
        // const _labelLeaves = element.exportData.annoTask.labelLeaves

        setSelectedLabelTreeIndex(_selectedLabelTreeIndex)
        // setLabelLeaves(_labelLeaves)

    }, [stateElement, peN])

    const graphRef = useRef()


    const findChildren = (branch, _selectedNodes, _foundChildren = []) => {

        branch.children.forEach((el) => {
            const isInList = _selectedNodes.filter((el2) => el2 === el.idx).length > 0
            if (isInList) {
                _foundChildren = [
                    ..._foundChildren,
                    ...el.children.map((el3) => el3.idx),
                ]
            }

            if (el.children.length) return findChildren(el, _selectedNodes, _foundChildren)
        })

        return _foundChildren
    }

    // removes a value from array
    const removeFromArr = (array, value) => {
        array.splice(array.indexOf(value), 1)
    }

    const updateSelectedNodeIDs = (clickedNodeID) => {

        // copy without reference to make useState work
        const _selectedNodeIDs = [...selectedNodeIDs]

        // toggle the index of the node that the user has clicked
        // (remove if its inside array, otherwise add it)
        if (_selectedNodeIDs.includes(clickedNodeID)) removeFromArr(_selectedNodeIDs, clickedNodeID)
        else {

            // remove children of clicked node from selectedNodesArray (double selection)
            const nodeChildren = findChildren(selectedTree, [clickedNodeID])
            nodeChildren.forEach((nodeChild) => {
                if (_selectedNodeIDs.includes(nodeChild)) removeFromArr(_selectedNodeIDs, clickedNodeID)
            })

            _selectedNodeIDs.push(clickedNodeID)
        }

        setSelectedNodeIDs(_selectedNodeIDs)
    }

    // update selected node children if selected node ids has changed
    useEffect(() => {
        if (selectedTree === undefined) return

        console.info({ selectedNodeIDs })

        const _selectedLeaves = findChildren(selectedTree, selectedNodeIDs)
        setSelectedLeaves(_selectedLeaves)

        if (graphNet !== undefined) graphNet.selectNodes(selectedNodeIDs)
    }, [selectedNodeIDs, selectedTree])

    useEffect(() => {
        if (selectedLeaves.length === 0 || graphNet === undefined) return

        console.info({ selectedLeaves })

        graphNet.selectNodes(selectedLeaves)
    }, [selectedLeaves])

    const events = {
        select: (event) => {
            const clickedNodeID = event.nodes[0]

            if (clickedNodeID === undefined) return

            if (!graphData.isLeafArr.includes(clickedNodeID)) {

                updateSelectedNodeIDs(clickedNodeID)
            }

            verifyTab(peN, 3, true)
        },
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
        if (selectedLabelTreeIndex === undefined) return

        // get tree with selected index
        const _tree = availableLabelTrees.filter(
            (el) => el.idx === selectedLabelTreeIndex,
        )[0]

        setSelectedTree(_tree)
    }, [selectedLabelTreeIndex])

    useEffect(() => {
        if (selectedTree === undefined) return

        // @TODO handle situation if single branch

        // copy graphData without reference to make useEffekt work
        const _graphData = { ...graphData }

        _graphData.nodes.push({
            id: selectedTree.idx,
            label: selectedTree.name,
            chosen: true,
            color: selectedTree.color ? selectedTree.color : '#10515F',
            font: { color: '#FFFFFF' },
        })

        mapTreeToGraph(_graphData, selectedTree, selectedTree.idx)
    }, [selectedTree])

    // useEffect(() => {
    //     console.info(graphNet);
    // }, [graphNet])

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
                getNetwork={network => {
                    // access vis.js graph network api
                    setGraphNet(network)
                }}
            />

        </>
        //     </CardBody>
        // </Card>
    )
}

export default SelectLabel

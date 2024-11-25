import React, { Component } from 'react'
import { connect } from 'react-redux'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import DatasourceNode from './nodes/DatasourceNode'
import ScriptNode from './nodes/ScriptNode'
import Graph from 'react-directed-graph'
import actions from '../../../../actions/pipeline/pipelineStart'
import Modals from './modals'
import Loop from './nodes/LoopNode'
import VisualOutputNode from './nodes/VisualOutputNode'
import { CRow } from '@coreui/react'
import HelpButton from '../../../../components/HelpButton'

const { toggleModal, selectTab, verifyTab } = actions
class ShowStartPipeline extends Component {
    constructor() {
        super()
        this.nodesOnClick = this.nodesOnClick.bind(this)
    }
    renderNodes() {
        return this.props.data.elements.map((el) => {
            switch (el.type) {
                case 'datasource':
                    return <DatasourceNode key={el.id} {...el} />
                case 'script':
                    return <ScriptNode key={el.id} {...el} />
                case 'annoTask':
                    return <AnnoTaskNode key={el.id} {...el} />
                case 'dataExport':
                    return <DataExportNode key={el.id} {...el} />
                case 'visualOutput':
                    return <VisualOutputNode key={el.id} {...el} />
                case 'loop':
                    return <Loop key={el.id} {...el} />
                default:
                    break
            }
            return undefined
        })
    }

    nodesOnClick(id) {
        const element = this.props.data.elements.filter((el) => el.peN === id)[0]
        const isDataExport = 'dataExport' in element
        const isVisualOutput = 'visualOutput' in element
        if (!isDataExport && !isVisualOutput) {
            this.props.toggleModal(id)
        }
    }
    renderGraph() {
        if (this.props.data) {
            return (
                <Graph
                    enableZooming={true}
                    centerGraph={true}
                    svgStyle={this.props.step.svgStyle}
                    ref={this.graph}
                    nodesOnClick={this.nodesOnClick}
                >
                    {this.renderNodes()}
                </Graph>
            )
        }
    }
    render() {
        return (
            <div className="pipeline-start-2">
                <CRow className="justify-content-center">
                    <HelpButton
                        id={'pipeline-start-fillout'}
                        text={`Configure your pipeline according to your preferences.
                            Orange elements still need your configuration. 
                            Click on the element to configure it. 
                            Only when all elements are configured and green, 
                            you can assign a name and a description in the next step.`}
                    />
                </CRow>
                {this.renderGraph()}
                <Modals />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.pipelineStart.stepper.steps[1],
        data: state.pipelineStart.step1Data,
    }
}
export default connect(mapStateToProps, { toggleModal, selectTab, verifyTab })(
    ShowStartPipeline,
)

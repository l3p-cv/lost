import React, { Component } from 'react'
import { connect } from 'react-redux'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import DatasourceNode from './nodes/DatasourceNode'
import ScriptNode from './nodes/ScriptNode' 
import Graph from 'react-directed-graph'
import actions from 'actions/pipeline/pipelineStart'
import Modals from './modals'

const {toggleModal, selectTab, verifyTab} = actions
class ShowStartPipeline extends Component {
    constructor(){
        super()
        this.nodesOnClick = this.nodesOnClick.bind(this)
    }
    renderNodes() {
        return this.props.data.elements.map((el) => {
            let connections = []
            if(el.peOut){
                 connections = el.peOut.map(el => {
                    return {
                        id: el
                    }
                })
            }
            const obj = {
                id: el.peN,
                connection: connections
            }
            if ('datasource' in el) {
                obj.type = 'datasource'
                obj.title = 'Datasource'
                obj.data = el.datasource
                return <DatasourceNode
                    key={obj.id}
                    {...obj}
                />
            } else if ('script' in el) {
                obj.type = 'script'
                obj.title = 'Script'
                obj.data = el.script
                return <ScriptNode
                    key={obj.id}
                    {...obj}
                />
            } else if ('annoTask' in el) {
                obj.type = 'annoTask'
                obj.title = 'Annotation Task'
                obj.data = el.annoTask
                return <AnnoTaskNode
                    key={obj.id}
                    {...obj}
                />
            } else if ('dataExport' in el) {
                obj.type = 'dataExport'
                obj.title = 'Data Export'
                obj.data = el.dataExport
                return <DataExportNode
                    key={obj.id}
                    {...obj}
                />
            }
        })

    }

    nodesOnClick(id) {
        this.props.toggleModal(id)
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
            <div>
                {this.renderGraph()}
                <Modals/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return { 
        step: state.pipelineStart.stepper.steps[1],
        data: state.pipelineStart.step1Data
    }
}
export default connect(
    mapStateToProps, {toggleModal, selectTab, verifyTab}
)(ShowStartPipeline)













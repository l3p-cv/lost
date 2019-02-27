import React, { Component } from 'react'

import Modals from './modals'
import Graph from 'react-directed-graph'
import DatasourceNode from './nodes/DatasourceNode'
import ScriptNode from './nodes/ScriptNode'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import { connect } from 'react-redux'
import actions from 'actions/pipeline/pipelineRunning'
import TitleBox from './titleBox'

const { toggleModal } = actions

class ShowRunningPipeline extends Component {
    constructor() {
        super()
        this.graphMountPoint = React.createRef()
        this.nodesOnClick = this.nodesOnClick.bind(this)
    }


    nodesOnClick(id) {
        this.props.toggleModal(id)
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
                    footer: el.state,
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

            }
            )
        
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
                    titleBox= {<TitleBox {...this.props.data}/>}
                >
                    {this.renderNodes()}
                </Graph>
            )
        }
    }


    render() {
        return (
            <div ref={this.graphMountPoint}>
                {this.renderGraph()}
                <Modals />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('------------------------------kk------');
    console.log(state.pipelineRunning );
    console.log('------------------------------------');
    return { 
        step: state.pipelineRunning.steps[1],
        data: state.pipelineRunning.step1Data }
}


export default connect(
    mapStateToProps,
    { toggleModal }
)(ShowRunningPipeline)







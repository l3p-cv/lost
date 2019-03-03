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
import LoopNode from './nodes/LoopNode';

const { toggleModal, getPipeline } = actions

class ShowRunningPipeline extends Component {
    constructor() {
        super()
        this.graphMountPoint = React.createRef()
        this.nodesOnClick = this.nodesOnClick.bind(this)
    }

    componentDidMount(){
        this.timer = setInterval(()=>  this.props.getPipeline(this.props.data.id), 2000)
    }

    componentWillUnmount(){
        clearInterval(this.timer)
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
                } else if('loop' in el){
                    obj.type = 'loop'
                    obj.title = 'Loop'
                    obj.data = el.loop
                    return <LoopNode
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
    return { 
        step: state.pipelineRunning.steps[1],
        data: state.pipelineRunning.step1Data }
}


export default connect(
    mapStateToProps,
    { toggleModal, getPipeline }
)(ShowRunningPipeline)







import React, { Component } from 'react'

import Modal from './modals'
import Graph from 'react-directed-graph'
import DatasourceNode from './nodes/DatasourceNode'
import ScriptNode from './nodes/ScriptNode'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import { connect } from 'react-redux'
import actions from '../../../../actions/pipeline/pipelineRunning'

import TitleBox from './TitleBox'
import LoopNode from './nodes/LoopNode';
import VisualOutputNode from './nodes/VisualOutputNode'
import ToolBar from './Toolbar'

const { toggleModal, getPipeline } = actions

class ShowRunningPipeline extends Component {
    constructor() {
        super()
        this.graphMountPoint = React.createRef()
        this.nodesOnClick = this.nodesOnClick.bind(this)
        this.state = {
            pollingEnabled: false
        }
    }

    componentDidUpdate(){
        if(this.props.data && !this.state.pollingEnabled){
            this.setState({
                pollingEnabled:true
            })
            this.timer = setInterval(() => this.props.getPipeline(this.props.data.id), 2000)
        }
    }

    componentWillUnmount() {
        this.setState({
            pollingEnabled: false
        })
        clearInterval(this.timer)
    }


    nodesOnClick(id) {
        this.props.toggleModal(id)
    }

    renderNodes() {
        return this.props.data.elements.map((el) => {
            if ('datasource' in el) {
                return <DatasourceNode
                    key={el.id}
                    {...el}
                />
            } else if ('script' in el) {
                return <ScriptNode
                    key={el.id}
                    {...el}
                />
            } else if ('annoTask' in el) {
                return <AnnoTaskNode
                    key={el.id}
                    {...el}
                />
            } else if ('dataExport' in el) {
                return <DataExportNode
                    key={el.id}
                    {...el}
                />
            } else if ('loop' in el) {
                return <LoopNode
                    key={el.id}
                    {...el}
                />
            } else if ('visualOutput' in el) {
                return <VisualOutputNode
                    key={el.id}
                    {...el}
                />
            }
        return undefined
        }
        )

    }

    renderGraph() {
        if (this.props.data) {
            return (
                <div>
                    <Graph
                        enableZooming={true}
                        centerGraph={true}
                        svgStyle={this.props.step.svgStyle}
                        ref={this.graph}
                        nodesOnClick={this.nodesOnClick}
                        titleBox={<TitleBox {...this.props.data} />}
                    >
                        {this.renderNodes()}
                    </Graph>
                </div>

            )
        }
    }

    renderModal() {
        if (this.props.data) {
            const modalData = this.props.data.elements.filter(el => el.peN === this.props.step.modalClickedId)[0]
            if (modalData) {
                return (
                    <Modal
                        data={modalData}
                    />
                )
            }
        }
    }

    render() {
        return (
            <div className='pipeline-running-2' ref={this.graphMountPoint}>
                                <ToolBar
                     data={this.props.data}
                    />
                {this.renderGraph()}
                {this.renderModal()}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.pipelineRunning.steps[1],
        data: state.pipelineRunning.step1Data
    }
}


export default connect(
    mapStateToProps,
    { toggleModal, getPipeline }
)(ShowRunningPipeline)







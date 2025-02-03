import { useEffect, useRef, useState } from 'react'
import Graph from 'react-directed-graph'
import { connect } from 'react-redux'
import actions from '../../../../actions/pipeline/pipelineRunning'
import Modal from './modals'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import DatasourceNode from './nodes/DatasourceNode'
import LoopNode from './nodes/LoopNode'
import ScriptNode from './nodes/ScriptNode'
import VisualOutputNode from './nodes/VisualOutputNode'
import TitleBox from './TitleBox'
import ToolBar from './Toolbar'

const { toggleModal, getPipeline } = actions

const ShowRunningPipeline = ({ data, step, toggleModal, getPipeline }) => {
    const graphMountPoint = useRef(null)
    const [pollingEnabled, setPollingEnabled] = useState(false)

    useEffect(() => {
        if (data && !pollingEnabled) {
            setPollingEnabled(true)
            const timer = setInterval(() => getPipeline(data.id), 2000)
            return () => clearInterval(timer)
        }
    }, [data, pollingEnabled, getPipeline])

    const nodesOnClick = (id) => {
        toggleModal(id)
    }

    const renderNodes = () => {
        return data.elements.map((el) => {
            if ('datasource' in el) {
                return <DatasourceNode key={el.id} {...el} />
            } else if ('script' in el) {
                return <ScriptNode key={el.id} {...el} />
            } else if ('annoTask' in el) {
                return <AnnoTaskNode key={el.id} {...el} />
            } else if ('dataExport' in el) {
                return <DataExportNode key={el.id} {...el} />
            } else if ('loop' in el) {
                return <LoopNode key={el.id} {...el} />
            } else if ('visualOutput' in el) {
                return <VisualOutputNode key={el.id} {...el} />
            }
            return undefined
        })
    }

    const renderGraph = () => {
        if (data) {
            return (
                <div>
                    <Graph
                        enableZooming={true}
                        centerGraph={true}
                        svgStyle={step.svgStyle}
                        ref={graphMountPoint}
                        nodesOnClick={nodesOnClick}
                        titleBox={<TitleBox {...data} />}
                    >
                        {renderNodes()}
                    </Graph>
                </div>
            )
        }
    }

    const renderModal = () => {
        if (data) {
            const modalData = data.elements.find((el) => el.peN === step.modalClickedId)
            if (modalData) {
                return <Modal data={modalData} />
            }
        }
    }

    return (
        <div className="pipeline-running-2" ref={graphMountPoint}>
            <ToolBar data={data} />
            {renderGraph()}
            {renderModal()}
        </div>
    )
}

const mapStateToProps = (state) => ({
    step: state.pipelineRunning.steps[1],
    data: state.pipelineRunning.step1Data,
})

export default connect(mapStateToProps, { toggleModal, getPipeline })(ShowRunningPipeline)

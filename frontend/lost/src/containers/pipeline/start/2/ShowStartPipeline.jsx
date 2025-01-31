import { CRow } from '@coreui/react'
import { useRef } from 'react'
import Graph from 'react-directed-graph'
import { connect } from 'react-redux'
import actions from '../../../../actions/pipeline/pipelineStart'
import HelpButton from '../../../../components/HelpButton'
import Modals from './modals'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import DatasourceNode from './nodes/DatasourceNode'
import Loop from './nodes/LoopNode'
import ScriptNode from './nodes/ScriptNode'
import VisualOutputNode from './nodes/VisualOutputNode'

const { toggleModal, selectTab, verifyTab } = actions

const ShowStartPipeline = ({ data, step, toggleModal }) => {
    const graph = useRef(null)

    const nodesOnClick = (id) => {
        const element = data.elements.find((el) => el.peN === id)
        const isDataExport = 'dataExport' in element
        const isVisualOutput = 'visualOutput' in element
        if (!isDataExport && !isVisualOutput) {
            toggleModal(id)
        }
    }

    const renderNodes = () => {
        return data.elements.map((el) => {
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
                    return null
            }
        })
    }

    const renderGraph = () => {
        if (data) {
            return (
                <Graph
                    enableZooming={true}
                    centerGraph={true}
                    svgStyle={step.svgStyle}
                    ref={graph}
                    nodesOnClick={nodesOnClick}
                >
                    {renderNodes()}
                </Graph>
            )
        }
    }

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
            {renderGraph()}
            <Modals />
        </div>
    )
}

const mapStateToProps = (state) => ({
    step: state.pipelineStart.stepper.steps[1],
    data: state.pipelineStart.step1Data,
})

export default connect(mapStateToProps, { toggleModal, selectTab, verifyTab })(
    ShowStartPipeline,
)

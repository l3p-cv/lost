import React, { Component } from 'react'
import { connect } from 'react-redux'
import AnnoTaskNode from './nodes/AnnoTaskNode'
import DataExportNode from './nodes/DataExportNode'
import DatasourceNode from './nodes/DatasourceNode'
import ScriptNode from './nodes/ScriptNode' 
import Graph from 'react-directed-graph'

class ShowStartPipeline extends Component {

 

    renderNodes() {
        return this.props.stepData.data.elements.map((el) => {
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

    nodesOnClick() {

    }
    renderGraph() {
        if (this.props.stepData.data) {
            return (
                <Graph
                    enableZooming={true}
                    centerGraph={true}
                    svgStyle={this.props.stepData.svgStyle}
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
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return { stepData: state.pipelineStart.steps[1] }
}
export default connect(
    mapStateToProps, {}
)(ShowStartPipeline)












// import React, { Component } from 'react'
// import * as http from '../../../http'
// import Modals from './modal'
// import testData from './testData'
// import Graph from 'react-directed-graph'
// import DatasourceNode from './nodes/DatasourceNode'
// import ScriptNode from './nodes/ScriptNode'
// import AnnoTaskNode from './nodes/AnnoTaskNode'
// import DataExportNode from './nodes/DataExportNode'
// import { connect } from 'react-redux'
// import './nodes/node.scss'
// import actions from 'actions'
// import TitleBox from './titleBox'

// const { toggleModal } = actions

// class ShowRunningPipeline extends Component {
//     constructor() {
//         super()
//         this.graphMountPoint = React.createRef()
//         this.state = {
//             svgStyle: {
//                 width: "800px"
//             }
//         }
//         this.nodesOnClick = this.nodesOnClick.bind(this)
//     }
//     componentDidMount() {
//         console.log()
//         const mountPointWidth = this.graphMountPoint.current.offsetWidth
//         this.setState({
//             svgStyle: {
//                 width: mountPointWidth
//             }
//         }
//         )

//     }

//     nodesOnClick(id) {
//         this.props.toggleModal(id)
//     }

//     renderNodes() {
//         console.log('---------this.props---------------------------');
//         console.log(this.props);
//         console.log('------------------------------------');
//         if (this.props.data) {
//             return this.props.data.elements.map((el) => {
//                 const connections = el.peOut.map(el => {
//                     return {
//                         id: el
//                     }
//                 })
//                 const obj = {
//                     id: el.peN,
//                     footer: el.state,
//                     connection: connections
//                 }
//                 if ('datasource' in el) {
//                     obj.type = 'datasource'
//                     obj.title = 'Datasource'
//                     obj.data = el.datasource
//                     return <DatasourceNode
//                         key={obj.id}
//                         {...obj}
//                     />
//                 } else if ('script' in el) {
//                     obj.type = 'script'
//                     obj.title = 'Script'
//                     obj.data = el.script
//                     return <ScriptNode
//                         key={obj.id}
//                         {...obj}
//                     />
//                 } else if ('annoTask' in el) {
//                     obj.type = 'annoTask'
//                     obj.title = 'Annotation Task'
//                     obj.data = el.annoTask
//                     return <AnnoTaskNode
//                         key={obj.id}
//                         {...obj}
//                     />
//                 } else if ('dataExport' in el) {
//                     obj.type = 'dataExport'
//                     obj.title = 'Data Export'
//                     obj.data = el.dataExport
//                     return <DataExportNode
//                         key={obj.id}
//                         {...obj}
//                     />
//                 }

//             }
//             )
//         }
//     }

//     renderGraph() {
//         if (this.props.data) {
//             return (
//                 <Graph
//                     enableZooming={true}
//                     centerGraph={true}
//                     svgStyle={this.state.svgStyle}
//                     ref={this.graph}
//                     nodesOnClick={this.nodesOnClick}
//                     titleBox= {<TitleBox {...this.props.data}/>}
//                 >
//                     {this.renderNodes()}
//                 </Graph>
//             )
//         }
//     }
//     renderModals() {
//         return (
//             <Modals />
//         )
//     }

//     render() {
//         return (
//             <div ref={this.graphMountPoint}>
//                 {this.renderGraph()}
//                 {this.renderModals()}
//             </div>
//         )
//     }
// }

// const mapStateToProps = (state) => {
//     return { data: state.pipelineRunning.steps[1].data }
// }


// export default connect(
//     mapStateToProps,
//     { toggleModal }
// )(ShowRunningPipeline)







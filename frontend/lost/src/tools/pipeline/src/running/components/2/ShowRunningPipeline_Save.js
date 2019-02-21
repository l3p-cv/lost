import React, { Component } from 'react'
import DagreD3 from 'react-directed-graph'
import Node1 from './nodes/DatasourceNode'

import {connect} from 'react-redux'


// import './components/node.scss'
// import 'bootstrap/dist/css/bootstrap.min.css';


import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';



class ShowRunningPipeline extends Component {
    constructor() {
        super()
        this.svgStyle = {
            width: "800px",
            border: "2px solid"
        }

        this.toggle = this.toggle.bind(this);
        this.nodesOnClick = this.nodesOnClick.bind(this)
        this.state = {
            modal: false,
            nodes: [
                {
                    id: 0,
                    type: "node1",
                    title: 'DATASOURCE',
                    footer: "CUCUMBER",
                    connection: [
                        {
                            id: 1,
                        },
                        {
                            id: 2,
                        }
                    ],
                },
                {
                    id: 1,
                    type: "node1",
                    title: "SCRIPT",
                    footer: "CUCUMBER",
                    connection: [
                        {
                            id: 2,
                            label: 'test label ',

                        }
                    ],
                },
                {
                    id: 2,
                    type: "node1",
                    title: "ANNOTATIONTASK",
                    footer: "CUCUMBER",
                    connection: [
                        {
                            id: 0,
                            lineStyle: {
                                stroke: 'red',
                                strokeWidth: '1.8px',
                                fill: 'white',
                                strokeDasharray: '5, 5'
                            },
                            arrowheadStyle: {
                                fill: 'red',
                                stroke: 'none'
                            }
                        }
                    ],
                }
                // {
                //     id: 3,
                //     type: "node1",
                //     title: "BigBen",
                //     connection: [
                //         {
                //             id: 4,
                //             label: 'test label'
                //         }
                //     ],
                // },
                // {
                //     id: 4,
                //     type: "node1",
                //     title: "BigBen",
                //     connection: [
                //         {
                //             id: 5,
                //         }
                //     ],
                // },
                // {
                //     id: 5,
                //     type: "node1",
                //     title: "BigBen",
                //     connection: [
                //         {
                //             id: 1,
                //             label: "",
                //             lineStyle: {
                //                 stroke: 'red',
                //                 strokeWidth: '1.8px',
                //                 fill: 'white',
                //                 strokeDasharray: '5, 5'
                //             },
                //             arrowheadStyle: {
                //                 fill: 'red',
                //                 stroke: 'none'
                //             }
                //         }
                //     ],
                // },
            ],
        }
        this.testButtonHandler = this.testButtonHandler.bind(this)
    }

    componentDidMount() {

    }

    nodesOnClick(id) {
        console.log('----------id--------------------------');
        console.log(id);
        console.log('------------------------------------');
        this.toggle()
    }

    testButtonHandler() {
        let state = this.state
        state.nodes[1].title += "U"
        this.setState(state)
    }

    renderNodes() {
        return this.state.nodes.map((el) => {
            if (el.type = "node1") {
                return <Node1
                    {...el}
                />
            }
        })
    }

    toggle() {
        this.setState({
          modal: !this.state.modal
        });
      }

    render() {
        console.log('---------------this.props---------------------');
        console.log(this.props);
        console.log('------------------------------------');
        return (
            <div>
                <DagreD3
                    enableZooming={true}
                    centerGraph={true}
                    svgStyle={this.svgStyle}
                    ref={this.graph}
                    nodesOnClick={this.nodesOnClick}
                >
                    {this.renderNodes()}
                </DagreD3>
                <button onClick={this.testButtonHandler}>My Testing Button</button>
                <div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) =>{
    return {data: state.pipelineRunning.steps[1].data}
}

export default connect(
    mapStateToProps,
    {getPipelines,getPipeline,verifyTab, selectTab}
) (ShowRunningPipeline)
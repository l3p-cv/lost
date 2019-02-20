import React, { Component } from 'react'
import DagreD3 from 'react-directed-graph'
import Node1 from './nodes/DatasourceNode'
// import './components/node.scss'
// import 'bootstrap/dist/css/bootstrap.min.css';


import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';



class App extends Component {
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
        {/* <Button color="danger" onClick={this.toggle}>{this.props.buttonLabel}</Button> */}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
          <ModalBody>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
            </div>
        )
    }
}

export default App
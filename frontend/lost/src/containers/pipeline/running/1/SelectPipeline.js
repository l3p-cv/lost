import React, { Component } from 'react'
import actions from '../../../../actions/pipeline/pipelineRunning'

import { connect } from 'react-redux'
import Datatable from '../../../../components/Datatable'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../../components/IconButton'
import HelpButton from '../../../../components/HelpButton'
import { Progress } from 'reactstrap'
import { getColor } from '../../../../containers/Annotation/AnnoTask/utils'
const { getPipelines, getPipeline, verifyTab, selectTab, reset } = actions

class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
        this.state = {
            pollingEnabled: false,
        }
    }
    async componentDidMount() {
        const showAlert = true
        await this.props.getPipelines(showAlert)
    }

    componentDidUpdate() {
        if (this.props.data && !this.state.pollingEnabled) {
            this.setState({
                pollingEnabled: true,
            })
            this.timer = setInterval(() => this.props.getPipelines(), 2000)
        }
    }

    componentWillUnmount() {
        this.setState({
            pollingEnabled: false,
        })
        clearInterval(this.timer)
    }

    selectRow(id) {
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
        this.props.reset()
        this.props.getPipeline(id)
    }

    renderDatatable() {
        if (this.props.data) {
            if (this.props.data.error) {
                return (
                    <div className="pipeline-error-message">{this.props.data.error}</div>
                )
            }
            const data = this.props.data.response.pipes.map((el) => ({
                ...el,
                date: new Date(`${el.date} GMT -0000`),
            }))
            return (
                <Datatable
                    columns={[
                        {
                            Header: 'Name',
                            accessor: 'name',
                            Cell: (row) => {
                                return <b>{row.original.name}</b>
                            },
                        },
                        {
                            Header: 'Description',
                            accessor: 'description',
                            Cell: (row) => {
                                return (
                                    <HelpButton
                                        id={row.original.id}
                                        text={row.original.description}
                                    />
                                )
                            },
                        },
                        {
                            Header: 'Template Name',
                            accessor: 'templateName',
                            Cell: (row) => {
                                return <b>{row.original.templateName}</b>
                            },
                        },
                        // {
                        //     Header: 'Author',
                        //     accessor: 'creatorName',
                        // },
                        {
                            Header: 'Progress',
                            accessor: 'progress',
                            Cell: (row) => {
                                const progress = parseInt(row.value)
                                if (row.value === 'ERROR') {
                                    return (
                                        <div>
                                            <font color="red">ERROR</font>
                                        </div>
                                    )
                                }
                                if (row.value === 'PAUSED') {
                                    return (
                                        <div>
                                            <font color="orange">PAUSED</font>
                                        </div>
                                    )
                                }
                                return (
                                    <Progress
                                        className="progress-xs rt-progress"
                                        color={getColor(progress)}
                                        value={progress}
                                    />
                                    // <Progress
                                    //     className="progress-xs rt-progress"
                                    //     color="warning"
                                    //     value={progress}
                                    // />
                                )
                            },
                        },
                        {
                            Header: 'Started on',
                            accessor: 'date',
                            Cell: (row) => {
                                return new Date(row.value).toLocaleString('de')
                            },
                            sortMethod: (date1, date2) => {
                                if (new Date(date1) > new Date(date2)) {
                                    return -1
                                }
                                return 1
                            },
                        },
                        {
                            Header: 'Start',
                            Cell: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        size="m"
                                        isOutline={false}
                                        onClick={() => this.selectRow(row.original.id)}
                                        icon={faEye}
                                        text="Open"
                                    />
                                )
                            },
                            accessor: 'id',
                        },
                    ]}
                    // getTrProps={(state, rowInfo) => ({
                    //     onClick: () => this.selectRow(rowInfo.original.id),
                    // })}
                    defaultSorted={[
                        {
                            id: 'date',
                            desc: false,
                        },
                    ]}
                    data={data}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            )
        }
    }

    render() {
        return <div className="pipeline-running-1">{this.renderDatatable()}</div>
    }
}

const mapStateToProps = (state) => {
    return { data: state.pipelineRunning.step0Data }
}

export default connect(mapStateToProps, {
    getPipelines,
    getPipeline,
    verifyTab,
    selectTab,
    reset,
})(SelectPipeline)

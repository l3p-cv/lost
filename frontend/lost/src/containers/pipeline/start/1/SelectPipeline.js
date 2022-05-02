import React, { Component } from 'react'
import actions from '../../../../actions/pipeline/pipelineStart'
import { connect } from 'react-redux'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../../../components/IconButton'
import Datatable from '../../../../components/Datatable'
import HelpButton from '../../../../components/HelpButton'
const { getTemplates, selectTab, verifyTab, getTemplate } = actions

class SelectPipeline extends Component {
    constructor() {
        super()
        this.selectRow = this.selectRow.bind(this)
    }
    async componentDidMount() {
        await this.props.getTemplates('all')
    }

    async selectRow(id) {
        await this.props.getTemplate(id)
        this.props.verifyTab(0, true)
        this.props.selectTab(1)
    }

    renderDatatable() {
        if (this.props.data) {
            if (this.props.data.error) {
                return (
                    <div className="pipeline-error-message">{this.props.data.error}</div>
                )
            }
            const data = this.props.data.response.templates.map((el) => ({
                ...el,
            }))
            return (
                <Datatable
                    columns={[
                        {
                            Header: 'Name / Project',
                            accessor: 'name',
                            Cell: (row) => {
                                return (
                                    <>
                                        {' '}
                                        <b>{row.original.name.split('.')[1]}</b>{' '}
                                        <div className="small text-muted">
                                            {`${row.original.name.split('.')[0]}`}
                                        </div>
                                    </>
                                )
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
                        // {
                        //     Header: 'Imported on',
                        //     Cell: (row) => {
                        //         return new Date(row.original.date).toLocaleString()
                        //     },
                        //     accessor: 'date',
                        //     sortMethod: (date1, date2) => {
                        //         if (new Date(date1) > new Date(date2)) {
                        //             return -1
                        //         }
                        //         return 1
                        //     },
                        // },
                        {
                            Header: 'Start',
                            Cell: (row) => {
                                return (
                                    <IconButton
                                        color="primary"
                                        size="m"
                                        isOutline={false}
                                        onClick={() => this.selectRow(row.original.id)}
                                        icon={faPlay}
                                        text="Start"
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
        return <div className="pipeline-start-1">{this.renderDatatable()}</div>
    }
}

const mapStateToProps = (state) => {
    return {
        data: state.pipelineStart.step0Data,
    }
}

export default connect(mapStateToProps, {
    getTemplates,
    selectTab,
    verifyTab,
    getTemplate,
})(SelectPipeline)

import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import actions from '../../../../actions/pipeline/pipelineStart'
import Datatable from '../../../../components/Datatable'
import HelpButton from '../../../../components/HelpButton'
import IconButton from '../../../../components/IconButton'

const { getTemplates, selectTab, verifyTab, getTemplate } = actions

const SelectPipeline = ({ data, getTemplates, getTemplate, selectTab, verifyTab }) => {
    useEffect(() => {
        const fetchTemplates = async () => {
            await getTemplates('all')
        }
        fetchTemplates()
    }, [getTemplates])

    const selectRow = async (id) => {
        await getTemplate(id)
        verifyTab(0, true)
        selectTab(1)
    }

    const renderDatatable = () => {
        if (data) {
            if (data.error) {
                return <div className="pipeline-error-message">{data.error}</div>
            }

            const templateData = data.response.templates.map((el) => ({
                ...el,
            }))

            return (
                <Datatable
                    columns={[
                        {
                            Header: 'Name / Project',
                            accessor: 'name',
                            Cell: (row) => (
                                <>
                                    <b>{row.original.name.split('.')[1]}</b>
                                    <div className="small text-muted">
                                        {`${row.original.name.split('.')[0]}`}
                                    </div>
                                </>
                            ),
                        },
                        {
                            Header: 'Description',
                            accessor: 'description',
                            Cell: (row) => (
                                <HelpButton
                                    id={row.original.id}
                                    text={row.original.description}
                                />
                            ),
                        },
                        {
                            Header: 'Start',
                            accessor: 'id',
                            Cell: (row) => (
                                <IconButton
                                    color="primary"
                                    size="m"
                                    isOutline={false}
                                    onClick={() => selectRow(row.original.id)}
                                    icon={faPlay}
                                    text="Start"
                                />
                            ),
                        },
                    ]}
                    defaultSorted={[
                        {
                            id: 'date',
                            desc: false,
                        },
                    ]}
                    data={templateData}
                    defaultPageSize={10}
                    className="-striped -highlight"
                />
            )
        }
    }

    return <div className="pipeline-start-1">{renderDatatable()}</div>
}

const mapStateToProps = (state) => ({
    data: state.pipelineStart.step0Data,
})

export default connect(mapStateToProps, {
    getTemplates,
    selectTab,
    verifyTab,
    getTemplate,
})(SelectPipeline)

import CollapseCard from '../../../globalComponents/modals/CollapseCard'
import Table from '../../../globalComponents/modals/Table'
import { CModalBody, CModalHeader } from '@coreui/react'

const DatasourceModal = (props) => {
    return (
        <>
            <CModalHeader>Datasource</CModalHeader>
            <CModalBody>
                <Table
                    data={[
                        {
                            key: 'Path',
                            value: props.datasource.rawFilePath,
                        },
                        {
                            key: 'Element ID',
                            value: props.id,
                        },
                    ]}
                />
                <CollapseCard>
                    <Table
                        data={[
                            {
                                key: 'Datasource ID',
                                value: props.datasource.id,
                            },
                            {
                                key: 'Status',
                                value: props.state,
                            },
                        ]}
                    />
                </CollapseCard>
            </CModalBody>
        </>
    )
}

export default DatasourceModal

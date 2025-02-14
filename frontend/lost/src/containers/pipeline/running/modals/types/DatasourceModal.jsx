import { ModalBody, ModalHeader } from 'reactstrap'
import CollapseCard from '../../../globalComponents/modals/CollapseCard'
import Table from '../../../globalComponents/modals/Table'

const DatasourceModal = (props) => {
    return (
        <>
            <ModalHeader>Datasource</ModalHeader>
            <ModalBody>
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
            </ModalBody>
        </>
    )
}

export default DatasourceModal

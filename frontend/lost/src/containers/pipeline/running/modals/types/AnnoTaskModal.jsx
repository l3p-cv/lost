import { faCircle, faEye } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import * as Notification from '../../../../../components/Notification'
import AnnoTaskTabs from './AnnoTaskModalUtils/AnnoTaskTabs'
import { CCol, CRow } from '@coreui/react'
import CoreIconButton from '../../../../../components/CoreIconButton'
import BaseModal from '../../../../../components/BaseModal'
import CoreDataTable from '../../../../../components/CoreDataTable'
import { createColumnHelper } from '@tanstack/react-table'

const AnnoTaskModal = ({
  modalOpened,
  annoTask,
  id,
  state,
  changeUser,
  chooseAnnoTask,
  siaReviewSetElement,
  forceAnnotationRelease,
  onClose,
}) => {
  function handleSiaRewiewClick(callback) {
    siaReviewSetElement(id)
    chooseAnnoTask(annoTask.id, callback)
  }

  function annotationReleaseSuccessful() {
    Notification.showSuccess('Annotations were successfully released.')
  }

  function handleForceAnnotationRelease() {
    forceAnnotationRelease(annoTask.id, annotationReleaseSuccessful)
  }
  const navigate = useNavigate()

  const columnHelper = createColumnHelper()
  const columns = [
    columnHelper.accessor('taskName', {
      header: () => 'Attribute',
      cell: ({ row }) => {
        return <b>{`${row.original.key}:`}</b>
      },
    }),
    columnHelper.accessor('taskName', {
      header: () => 'Value',
      cell: ({ row }) => {
        return <>{row.original.value}</>
      },
    }),
  ]

  return (
    <BaseModal title="Annotation Task" isOpen={modalOpened} size="lg" onClosed={onClose}>
      <CoreDataTable
        rowHeight="35px"
        tableData={[
          {
            key: 'Annotation Task Name',
            value: annoTask.name,
          },
          {
            key: 'Annotation Task ID',
            value: annoTask.id,
          },
          {
            key: 'Pipe Element ID',
            value: id,
          },
          {
            key: 'Type',
            value: annoTask.type,
          },
          {
            key: 'Status',
            value: state,
          },
        ]}
        columns={columns}
        usePagination={false}
      />
      <hr />
      <AnnoTaskTabs
        annotask={annoTask}
        changeUser={changeUser}
        datasetList={[]}
        datastoreList={[]}
        hasChangeUser={true}
        hasShowLabels={true}
        hasAdaptConfiguration={true}
      />
      <CRow className="justify-content-end">
        <CCol sm="auto">
          <CoreIconButton
            icon={faEye}
            color="primary"
            style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
            onClick={(e) =>
              handleSiaRewiewClick(() => {
                navigate(`/annotasks/${annoTask.id}/review`)
              })
            }
            text="Review Annotations"
          />
          <CoreIconButton
            icon={faCircle}
            color="danger"
            style={{ marginLeft: 10, marginTop: 20, marginBottom: '1rem' }}
            onClick={(e) => handleForceAnnotationRelease()}
            text="Force Annotation Release"
          />
        </CCol>
      </CRow>
    </BaseModal>
  )
}

export default AnnoTaskModal

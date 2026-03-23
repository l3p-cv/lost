import React from 'react'
import AmountPerLabel from './AnnoTask/AmountPerLabel'
import MyAnnoTasks from './AnnoTask/MyAnnoTasks'
import WorkingOn from './AnnoTask/WorkingOn'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCol, CContainer, CRow } from '@coreui/react'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useChooseAnnotask, useGetCurrentAnnotask } from '../../api/anno_task'

const AnnotatorDashboard = () => {
  const navigate = useNavigate()
  const { data: workingOnAnnoTask, isLoading } = useGetCurrentAnnotask()
  const { mutate: chooseAT } = useChooseAnnotask()

  const gotoAnnoTask = (id, type) => {
    const path = type === 'MIA' ? '/mia' : type === 'SIA' ? '/sia' : null
    if (path) {
      chooseAT(id, {
        onSuccess: () => {
          navigate(path)
        },
      })
    }
  }

  const renderWorkingOn = () => {
    if (workingOnAnnoTask !== null && workingOnAnnoTask !== undefined) {
      return (
        <CRow>
          <CCol>
            <h3>Working on</h3>
            <ErrorBoundary>
              <CCard>
                <CCardBody>
                  <CRow>
                    <CCol xs="12" md="6" xl="6">
                      <WorkingOn annoTask={workingOnAnnoTask}></WorkingOn>
                    </CCol>
                    {workingOnAnnoTask.statistic.amount_per_label && (
                      <CCol xs="12" md="6" xl="6">
                        <AmountPerLabel
                          stats={workingOnAnnoTask.statistic.amount_per_label}
                        />
                      </CCol>
                    )}
                  </CRow>
                </CCardBody>
              </CCard>
            </ErrorBoundary>
          </CCol>
        </CRow>
      )
    }
    return <React.Fragment></React.Fragment>
  }

  return (
    <CContainer>
      <CRow className="mt-3">
        <h3 className="card-title" style={{ textAlign: 'center' }}>
          Annotation
        </h3>
      </CRow>
      {renderWorkingOn()}
      <CRow>
        <h3 className="mt-4">My Annotation Tasks</h3>
      </CRow>
      <CRow>
        <CCol>
          <CCard>
            <CCardBody>
              <MyAnnoTasks callBack={(id, type) => gotoAnnoTask(id, type)}></MyAnnoTasks>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AnnotatorDashboard

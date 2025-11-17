import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import Facts from '../../../components/Dashboard/Annotator/Facts'
// import ImagesPerDay from '../../../components/Dashboard/Annotator/ImagesPerDay'
import AmountPerLabel from './AnnoTask/AmountPerLabel'
import MyAnnoTasks from './AnnoTask/MyAnnoTasks'
import WorkingOn from './AnnoTask/WorkingOn'
import actions from '../../actions'
import { useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react'
import TableHeader from '../../components/TableHeader'
import ErrorBoundary from '../../components/ErrorBoundary'

const { getAnnoTasks, getWorkingOnAnnoTask, chooseAnnoTask } = actions

const AnnotatorDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const annoTasks = useSelector((state) => state.annoTask.annoTasks)
  const workingOnAnnoTask = useSelector((state) => state.annoTask.workingOnAnnoTask)

  useEffect(() => {
    // dispatch(getAnnoTasks())
    dispatch(getWorkingOnAnnoTask())

    // const intervalAction = () => dispatch(getAnnoTasks())
    // const interval = setInterval(intervalAction, 1000)

    // return () => {
    //     clearInterval(interval)
    // }
  }, [])

  const gotoAnnoTask = (id, type) => {
    if (type === 'MIA') {
      dispatch(chooseAnnoTask(id, () => navigate('/mia')))
    } else if (type === 'SIA') {
      dispatch(chooseAnnoTask(id, () => navigate('/sia')))
    }
  }

  const renderWorkingOn = () => {
    if (workingOnAnnoTask !== null) {
      return (
        <CContainer style={{ marginTop: '15px' }}>
          <h3 className="card-title mb-3" style={{ textAlign: 'center' }}>
            Annotation
          </h3>
          <CRow>
            <CCol className="mt-3">
              <TableHeader
                headline="Working on"
                buttonStyle={{ marginTop: 15, marginBottom: 20, visibility: 'hidden' }}
              />
              <ErrorBoundary>
                <CCard>
                  {/* <CCardHeader>
                                    <h4>Working on</h4>
                                </CCardHeader> */}
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
        </CContainer>
      )
    }
    return <React.Fragment></React.Fragment>
  }

  return (
    <CContainer>
      {renderWorkingOn()}
      <CRow>
        <CCol className="mt-3">
          <TableHeader
            headline="My Annotation Tasks"
            buttonStyle={{ marginTop: 15, marginBottom: 20, visibility: 'hidden' }}
          />
          <CCard>
            {/* <CCardHeader>
                            <h4>My Annotation Tasks</h4>
                        </CCardHeader> */}
            <CCardBody>
              <MyAnnoTasks
                annoTasks={annoTasks}
                callBack={(id, type) => gotoAnnoTask(id, type)}
              ></MyAnnoTasks>
            </CCardBody>
          </CCard>
          {/* <Card>
                        <CardHeader>
                            Statistics
                        </CardHeader>
                        <CardBody>
                            <Facts></Facts>
                            <br/>
                            <div>Images/Day</div>
                            <br/>
                            <ImagesPerDay></ImagesPerDay>
                        </CardBody>
                    </Card> */}
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default AnnotatorDashboard

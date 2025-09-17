import React from 'react'
import { getColor } from './utils'
import IconButton from '../../../components/IconButton'

import { useNavigate } from 'react-router-dom'
import { faFastForward } from '@fortawesome/free-solid-svg-icons'
import { CCol, CProgress, CRow } from '@coreui/react'
import CoreIconButton from '../../../components/CoreIconButton'

const WorkingOn = ({ annoTask }) => {
    const navigate = useNavigate()

    const handleContinue = (type) => {
        navigate(`/${type.toLowerCase()}`)
    }

    const progress = Math.floor((annoTask.finished / annoTask.size) * 100)

    return (
        <>
            <CRow>
                <CCol xs={12} md={6} className="mt-2">
                    <div className="border-start border-start-4 border-start-danger py-1 px-3">
                        <div className="text-body-secondary text-truncate small">
                            Working on
                        </div>
                        <div className="fs-5 fw-semibold">{annoTask.name}</div>
                    </div>
                </CCol>
                <CCol xs={12} md={6} className="mt-2">
                    <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">
                            Pipeline
                        </div>
                        <div className="fs-5 fw-semibold">{annoTask.pipeline_name}</div>
                    </div>
                </CCol>
                <CCol xs={12} md={6} className="mt-2">
                    <div className="border-start border-start-4 border-start-warning py-1 px-3">
                        <div className="text-body-secondary text-truncate small">
                            Annotations
                        </div>
                        <div className="fs-5 fw-semibold">
                            {annoTask.finished}/{annoTask.size}
                        </div>
                    </div>
                </CCol>
                <CCol xs={12} md={6} className="mt-2">
                    <div className="border-start border-start-4 border-start-success py-1 px-3">
                        <div className="text-body-secondary text-truncate small">
                            Seconds/Annotation
                        </div>
                        <div className="fs-5 fw-semibold">
                            &#8709; {annoTask.statistic.seconds_per_anno}
                        </div>
                    </div>
                </CCol>
            </CRow>
            <CRow>
                <CCol className="mt-3">
                    <strong>{progress}%</strong>
                </CCol>
            </CRow>
            <CRow>
                <CCol>Started at: {new Date(annoTask.createdAt).toLocaleString()}</CCol>
            </CRow>
            <CRow>
                <CCol>
                    <CProgress
                        className="progress-xs"
                        color={getColor(progress)}
                        value={progress}
                    />
                </CCol>
            </CRow>

            <CRow>
                <CCol xs="4" className="mt-5">
                    <CoreIconButton
                        onClick={() => handleContinue(annoTask.type)}
                        color="primary"
                        isOutline={true}
                        icon={faFastForward}
                        text="Continue"
                    />
                </CCol>
                {annoTask.type === 'SIA' && (
                    <CCol xs="7" className="mt-5">
                        <CoreIconButton
                            onClick={() => navigate(`/sia2`)}
                            color="primary"
                            isOutline={true}
                            icon={faFastForward}
                            text="Continue using the new SIA"
                        />
                    </CCol>
                )}
            </CRow>
        </>
    )
}

export default WorkingOn

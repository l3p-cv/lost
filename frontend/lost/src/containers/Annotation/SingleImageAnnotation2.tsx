import { CSSProperties } from 'react'

import WorkingOnSIA from './AnnoTask/WorkingOnSIA'
import SiaWrapper from './SIA/SiaWrapper2'
import * as annotaskApi from '../../actions/annoTask/anno_task_api'

const SingleImageAnnotation = () => {
    const { data: currentAnnotask } = annotaskApi.useGetCurrentAnnotask()

    // method to get the available height of the page without scrolling
    const contentRootStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 375px)',
        overflow: 'hidden',
        marginTop: 10,
    }

    const middleStyle: CSSProperties = {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        minHeight: 0,
    }

    if (currentAnnotask === undefined) return 'Loading...'

    return (
        <>
            <WorkingOnSIA annoTask={currentAnnotask} />

            <div style={contentRootStyle}>
                <div style={middleStyle}>
                    <SiaWrapper
                        annotaskId={currentAnnotask.id}
                        isDatasetMode={false}
                        isImageSearchEnabled={true}
                    />
                </div>
            </div>
        </>
    )
}

export default SingleImageAnnotation

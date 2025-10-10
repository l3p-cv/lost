import { CButton, CButtonGroup } from '@coreui/react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
    faCodeMerge,
    faExpand,
    faObjectUngroup,
    faScissors,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PolygonEditMode from '../../../models/PolygonEditMode'

type PolygonEditButtonsProps = {
    polygonEditMode: PolygonEditMode
    onPolygonEditModeChanged: (newMode: PolygonEditMode) => void
}

const PolygonEditButtons = ({
    polygonEditMode,
    onPolygonEditModeChanged,
}: PolygonEditButtonsProps) => {
    const changeMode = (clickedMode: PolygonEditMode) => {
        // deactivate mode if clicking on currently active mode
        const newMode =
            polygonEditMode == clickedMode ? PolygonEditMode.NONE : clickedMode
        onPolygonEditModeChanged(newMode)
    }

    return (
        <CButtonGroup role="group" aria-label="Basic example">
            <CButton
                color="primary"
                variant={polygonEditMode == PolygonEditMode.MERGE ? undefined : 'outline'}
                onClick={() => changeMode(PolygonEditMode.MERGE)}
            >
                <FontAwesomeIcon icon={faCodeMerge as IconProp} size="lg" />
            </CButton>

            <CButton
                color="primary"
                variant={
                    polygonEditMode == PolygonEditMode.INTERSECT ? undefined : 'outline'
                }
                onClick={() => changeMode(PolygonEditMode.INTERSECT)}
            >
                <FontAwesomeIcon icon={faObjectUngroup as IconProp} size="lg" />
            </CButton>

            <CButton
                color="primary"
                variant={
                    polygonEditMode == PolygonEditMode.DIFFERENCE ? undefined : 'outline'
                }
                onClick={() => changeMode(PolygonEditMode.DIFFERENCE)}
            >
                <FontAwesomeIcon icon={faScissors as IconProp} size="lg" />
            </CButton>

            <CButton
                color="primary"
                variant={polygonEditMode == PolygonEditMode.BBOX ? undefined : 'outline'}
                onClick={() => changeMode(PolygonEditMode.BBOX)}
            >
                <FontAwesomeIcon icon={faExpand as IconProp} size="lg" />
            </CButton>
        </CButtonGroup>
    )
}

export default PolygonEditButtons

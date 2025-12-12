import { CButtonGroup } from '@coreui/react'
import {
  faCodeMerge,
  faExpand,
  faObjectUngroup,
  faScissors,
} from '@fortawesome/free-solid-svg-icons'
import PolygonEditMode from '../../../models/PolygonEditMode'
import CoreIconButton from '../../../components/CoreIconButton'

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
    const newMode = polygonEditMode == clickedMode ? PolygonEditMode.NONE : clickedMode
    onPolygonEditModeChanged(newMode)
  }

  return (
    <CButtonGroup role="group" aria-label="Basic example">
      <CoreIconButton
        color="primary"
        icon={faCodeMerge}
        isOutline={polygonEditMode !== PolygonEditMode.MERGE}
        onClick={() => changeMode(PolygonEditMode.MERGE)}
        toolTip="Merge annotations"
      />

      <CoreIconButton
        color="primary"
        icon={faObjectUngroup}
        isOutline={polygonEditMode !== PolygonEditMode.INTERSECT}
        onClick={() => changeMode(PolygonEditMode.INTERSECT)}
        toolTip="Intersect annotations"
      />

      <CoreIconButton
        color="primary"
        icon={faScissors}
        isOutline={polygonEditMode !== PolygonEditMode.DIFFERENCE}
        onClick={() => changeMode(PolygonEditMode.DIFFERENCE)}
        toolTip="Differ annotations"
      />

      <CoreIconButton
        color="primary"
        icon={faExpand}
        isOutline={polygonEditMode !== PolygonEditMode.BBOX}
        onClick={() => changeMode(PolygonEditMode.BBOX)}
        toolTip="Create BBox of annotation"
      />
    </CButtonGroup>
  )
}

export default PolygonEditButtons

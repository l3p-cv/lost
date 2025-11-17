import { CButtonGroup } from '@coreui/react'
import {
  faCodeMerge,
  faExpand,
  faObjectUngroup,
  faScissors,
} from '@fortawesome/free-solid-svg-icons'
import PolygonEditMode from '../../../models/PolygonEditMode'
import { IconButton } from 'lost-sia'

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
      <IconButton
        color="primary"
        icon={faCodeMerge}
        isOutline={polygonEditMode !== PolygonEditMode.MERGE}
        onClick={() => changeMode(PolygonEditMode.MERGE)}
        tooltip="Merge annotations"
      />

      <IconButton
        color="primary"
        icon={faObjectUngroup}
        isOutline={polygonEditMode !== PolygonEditMode.INTERSECT}
        onClick={() => changeMode(PolygonEditMode.INTERSECT)}
        tooltip="Intersect annotations"
      />

      <IconButton
        color="primary"
        icon={faScissors}
        isOutline={polygonEditMode !== PolygonEditMode.DIFFERENCE}
        onClick={() => changeMode(PolygonEditMode.DIFFERENCE)}
        tooltip="Differ annotations"
      />

      <IconButton
        color="primary"
        icon={faExpand}
        isOutline={polygonEditMode !== PolygonEditMode.BBOX}
        onClick={() => changeMode(PolygonEditMode.BBOX)}
        tooltip="Create BBox of annotation"
      />
    </CButtonGroup>
  )
}

export default PolygonEditButtons

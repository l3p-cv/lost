import { useCallback, useState } from 'react'
import EditLabel from './EditLabel'
import LabelsPage from './LabelsPage'

const LabelTree = ({ labelTree, visLevel }) => {
    const [selectedLabel, setSelectedLabel] = useState(null)

    const clearSelectedLabel = useCallback(() => {
        setSelectedLabel(null)
    }, [])

    const renderEditLabel = (tree) => {
        if (!(tree.group_id === null ? visLevel !== 'global' : false)) {
            return (
                <EditLabel
                    label={selectedLabel}
                    clearSelectedLabel={clearSelectedLabel}
                    visLevel={visLevel}
                />
            )
        }
    }

    return labelTree ? (
        <>
            {renderEditLabel(labelTree)}
            <LabelsPage labelTree={labelTree} visLevel={visLevel} />
        </>
    ) : (
        <div>No Tree selected.</div>
    )
}

export default LabelTree

import { useCallback } from 'react'
import { connect } from 'react-redux'
import { Input } from 'reactstrap'
import actions from '../../../../../../actions/pipeline/pipelineStartModals/loop'
import Table from '../../../../globalComponents/modals/Table'

const { inputMaxIteration } = actions

const LoopModal = ({ exportData, inputMaxIteration, peN }) => {
    const onInput = useCallback(
        (e) => {
            const number = Number(e.target.value)
            if (!isNaN(number)) {
                inputMaxIteration(peN, number)
            }
        },
        [inputMaxIteration, peN],
    )

    return (
        <Table
            data={[
                {
                    key: 'Max Iteration',
                    value:
                        typeof exportData.loop.maxIteration === 'number' ? (
                            <Input
                                min={-1}
                                onInput={onInput}
                                defaultValue={exportData.loop.maxIteration}
                                placeholder="Amount"
                                type="number"
                                step="1"
                            />
                        ) : (
                            'Infinity'
                        ),
                },
            ]}
        />
    )
}

export default connect(null, { inputMaxIteration })(LoopModal)

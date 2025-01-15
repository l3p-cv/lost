const inputMaxIteration = (elementId, value) => {
    return {
        type: 'PIPELINE_START_LOOP_INPUT_MAXITERATION',
        payload: {
            elementId,
            value,
        },
    }
}

export default {
    inputMaxIteration,
}

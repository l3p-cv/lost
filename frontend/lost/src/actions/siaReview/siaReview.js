import TYPES from '../../types/index'

/**
 * Set PipelineElement to review
 * 
 * @param {int} elementID - ID of the element to review.
 */

export const siaReviewSetElement = (elementID) => {
    return {
        type: TYPES.SIA_REVIEW_SET_ELEMENT,
        payload: elementID
    }
}
import * as annoTask from './annoTask'
import * as lost from './lost'
import * as mia from './mia'
import * as sia from './sia'
import * as siaReview from './siaReview'
import * as worker from './worker'

export default {
    ...annoTask,
    ...mia,
    ...sia,
    ...worker,
    ...siaReview,
    ...lost,
}

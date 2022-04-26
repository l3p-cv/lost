import * as auth from './auth'
import * as label from './label'
import * as group from './group'
import * as user from './user'
import * as annoTask from './annoTask'
import * as mia from './mia'
import * as sia from './sia'
import * as worker from './worker'
import * as pipeline from './pipeline'
import * as siaReview from './siaReview'
import * as lost from './lost'

export default {
    ...auth,
    ...label,
    ...group,
    ...user,
    ...annoTask,
    ...mia,
    ...sia,
    ...worker,
    ...pipeline,
    ...siaReview,
    ...lost,
}

import * as auth from './auth'
import * as label from './label'
import * as group from './group'
import * as user from './user'
import * as annoTask from './annoTask'
import * as mia from './mia'
import * as worker from './worker'

export default { ...auth, ...label, ...group, ...user, ...annoTask, ...mia, ...worker }
import auth from './auth'
import label from './label/index'
import group from './group/index'
import user from './user/index'
import annoTask from './annoTask'
import mia from './mia'

export default { ...auth, ...label, ...group, ...user, ...annoTask, ...mia}

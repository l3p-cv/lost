import reduxThunk from 'redux-thunk'
import { createStore, applyMiddleware, compose } from 'redux'
import reducers from './reducers/index'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(reducers, {}, composeEnhancers(applyMiddleware(reduxThunk)))

export default store

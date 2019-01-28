import 'react-app-polyfill/ie9' // For IE 9-11 support
import 'react-app-polyfill/ie11' // For IE 11 support
import './polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import reduxThunk from 'redux-thunk'

import reducers from './reducers'

import App from './App'
import * as serviceWorker from './serviceWorker'

const store = createStore(reducers, {
    auth: {
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refreshToken'),
        view: localStorage.getItem('view'),
    },
    mia: {
        maxAmount: localStorage.getItem('mia-max-amount') ? localStorage.getItem('mia-max-amount'): 10 ,
        zoom: localStorage.getItem('mia-zoom') ? localStorage.getItem('mia-zoom'): 120,
        images: [],
        labels: [],
        selectedLabel: undefined
    }
}, applyMiddleware(reduxThunk))

ReactDOM.render(
    <Provider store={store}><App/></Provider>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls. Learn
// more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'

import App from './App'
import store from './store'

import './styles/dialog.css';
import './index.scss'

import 'utils';

const history = syncHistoryWithStore(browserHistory, store)

export const renderRoutes = (rootComponent) => (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/index.html" component={rootComponent}></Route>
    </Router>
  </Provider>
)

ReactDOM.render(renderRoutes(App), document.getElementById('root'))

if (module.hot) {
  module.hot.accept('./App.js', () => {
    const NextApp = require('./App').default
    ReactDOM.render(renderRoutes(NextApp), document.getElementById('root'))
    console.log('Hot module replaced..')
  })
}

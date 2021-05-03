import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import Settings from './reducers/Settings'
import Progress from './reducers/Progress'
import Chain from './reducers/Chain'

export default (history) => combineReducers({
  router: connectRouter(history),
  settings: Settings,
  progress: Progress,
  chain: Chain
});

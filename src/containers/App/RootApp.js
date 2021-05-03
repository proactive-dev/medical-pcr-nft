import React from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import MainApp from './MainApp'
import Error404 from '../../routes/common/Error404'
import Error500 from '../../routes/common/Error500'

const RootApp = (props) => {
  const {match} = props

  return (
    <Switch>
      <Route exact path="/404" component={Error404}/>
      <Route exact path="/500" component={Error500}/>
      <Route path={match.url} component={MainApp}/>
    </Switch>
  )
}

export default withRouter(injectIntl(RootApp))

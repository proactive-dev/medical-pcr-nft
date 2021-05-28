import React from 'react'
import { Redirect, Route, Switch, withRouter } from 'react-router-dom'
import { injectIntl } from 'react-intl'
import {
  CERTIFICATE,
  EDIT,
  HOME,
  LIST,
  NEW,
  REQUEST,
  SCAN,
  TYPE_ORGANIZATION,
  TYPE_USER,
  VIEW
} from '../../constants/AppConfigs'
import InfoEdit from '../../routes/main/InfoEdit'
import UserView from '../../routes/main/UserView'
import OrganizationView from '../../routes/main/OrganizationView'
import OrganizationList from '../../routes/main/OrganizationList'
import RequestEdit from '../../routes/main/RequestEdit'
import RequestList from '../../routes/main/RequestList'
import NewCertificate from '../../routes/main/NewCertificate'
import CertificateList from '../../routes/main/CertificateList'
import CertificateQRReader from '../../routes/main/CertificateQRReader'
import Home from '../../routes/main/Home'

const MainRoute = (props) => {
  const {match} = props

  return (
    <Switch>
      <Route exact path={`${match.url}${HOME}`}
             component={Home}/>
      <Route exact path={`${match.url}:type/${EDIT}`}
             component={InfoEdit}/>
      <Route exact path={`${match.url}${TYPE_USER}/${VIEW}`}
             component={UserView}/>
      <Route exact path={`${match.url}${CERTIFICATE}/${LIST}`}
             component={CertificateList}/>
      <Route exact path={`${match.url}${CERTIFICATE}/${NEW}/:id`}
             component={NewCertificate}/>
      <Route exact path={`${match.url}${CERTIFICATE}/${SCAN}`}
             component={CertificateQRReader}/>
      <Route exact path={`${match.url}${TYPE_ORGANIZATION}/${LIST}`}
             component={OrganizationList}/>
      <Route exact path={`${match.url}${VIEW}`}
             component={OrganizationView}/>
      <Route exact path={`${match.url}${TYPE_ORGANIZATION}/${VIEW}/:account`}
             component={OrganizationView}/>
      <Route exact path={`${match.url}:type/${REQUEST}/${NEW}`}
             component={RequestEdit}/>
      <Route exact path={`${match.url}${REQUEST}/${LIST}`}
             component={RequestList}/>
      <Redirect exact from="/" to={`/${HOME}`}/>
      <Redirect from="*" to="/404"/>
    </Switch>
  )
}

export default withRouter(injectIntl(MainRoute))

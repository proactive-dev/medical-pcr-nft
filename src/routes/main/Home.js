import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Col, Row } from 'antd'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'
import { openNotificationWithIcon } from '../../components/Messages'
import { DEEDS, ERROR, NEW } from '../../constants/AppConfigs'

const Home = (props) => {

  const {intl, history, connectedAccount} = props

  const handleNewDeed = () => {
    if (!_.isEmpty(connectedAccount) && !_.isEmpty(connectedAccount.address)) {
      history.push(`/${NEW}`)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.connectAccount'}))
    }
  }

  const handleDeeds = () => {
    if (!_.isEmpty(connectedAccount) && !_.isEmpty(connectedAccount.address)) {
      history.push(`/${DEEDS}`)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.connectAccount'}))
    }
  }

  return (
    <div>
      <Row className="gx-m-2 gx-p-2">
        <Col span={6} xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
          <Button className="gx-mt-4 login-form-button" type="primary" onClick={handleNewDeed}>
            <FormattedMessage id="deed.new"/>
          </Button>
        </Col>
        <Col span={6} xxl={6} xl={6} lg={6} md={12} sm={12} xs={24}>
          <Button className="gx-mt-4 login-form-button" type="primary" onClick={handleDeeds}>
            <FormattedMessage id="deed.list"/>
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default withRouter(injectIntl(Home))

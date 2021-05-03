import React, { Fragment } from 'react'
import { Button, Popconfirm } from 'antd'
import { FormattedMessage } from 'react-intl'
import { openNotificationWithIcon } from './Messages'
import { ERROR } from '../constants/AppConfigs'

const ConfirmButton = ({intl, form, btnTitle, confirmEnabled}) => {
  const onConfirm = (event) => {
    form.current.submit()
  }
  const onCancel = (event) => {
    openNotificationWithIcon(ERROR, intl.formatMessage({id: 'transaction.canceled'}))
  }

  return (
    <Fragment>
      {
        !confirmEnabled &&
        <Button className="gx-mt-4 login-form-button" type="primary" onClick={onConfirm}>
          <FormattedMessage id={btnTitle}/>
        </Button>
      }
      {
        confirmEnabled &&
        <Popconfirm
          title={intl.formatMessage({id: 'transaction.confirm'})}
          okText={intl.formatMessage({id: 'confirm'})}
          cancelText={intl.formatMessage({id: 'cancel'})}
          onConfirm={onConfirm}
          onCancel={onCancel}
        >
          <Button className="gx-mt-4 login-form-button" type="primary">
            <FormattedMessage id={btnTitle}/>
          </Button>
        </Popconfirm>
      }
    </Fragment>
  )
}

export default ConfirmButton

import React from 'react'
import { Button } from 'antd'
import { FormattedMessage } from 'react-intl'
import { GitlabFilled } from '@ant-design/icons'

const MetaMaskButton = (props) => {
  return (
    <Button
      size="large"
      className="gx-btn-secondary login-form-button"
      icon={<GitlabFilled/>}
      onClick={props.onClick}>
      &nbsp;<FormattedMessage id="connect.metaMask"/>
    </Button>
  )
}

export default MetaMaskButton

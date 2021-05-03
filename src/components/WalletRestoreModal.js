import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { Alert, Input, Modal } from 'antd'
import { ethers } from 'ethers'
import { openNotificationWithIcon } from './Messages'
import { ERROR } from '../constants/AppConfigs'

const WalletRestoreModal = (props) => {
  const {intl, onOk, onCancel} = props
  const [key, setKey] = useState(null)
  const [okButtonEnabled, setOkButtonEnabled] = useState(false)

  const handleOk = () => {
    try {
      const wallet = new ethers.Wallet(key)
      onOk(wallet)
    } catch (error) {
      console.log(error.message)
      openNotificationWithIcon(ERROR, error.message)
    }
  }

  const handleKeyChange = e => {
    setKey(e.target.value)
    setOkButtonEnabled(!!e.target.value)
  }

  return (
    <Modal
      visible={true}
      title={intl.formatMessage({id: 'import.or.restore'})}
      okText={intl.formatMessage({id: 'restore'})}
      cancelText={intl.formatMessage({id: 'cancel'})}
      okButtonProps={{disabled: !okButtonEnabled}}
      onOk={handleOk}
      onCancel={onCancel}>
      <Alert className={'gx-m-1'} message={intl.formatMessage({id: 'restore.desc'})} type="info" showIcon/>
      <Input
        className={'gx-m-1'}
        addonBefore={intl.formatMessage({id: 'private.key'})}
        onChange={handleKeyChange}/>
    </Modal>
  )
}

export default injectIntl(WalletRestoreModal)

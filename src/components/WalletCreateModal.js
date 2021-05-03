import React, { useEffect, useState } from 'react'
import { injectIntl } from 'react-intl'
import { Alert, Checkbox, Input, Modal } from 'antd'
import { ethers } from 'ethers'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { CopyOutlined } from '@ant-design/icons'
import { openNotificationWithIcon } from './Messages'
import { SUCCESS } from '../constants/AppConfigs'

const WalletCreateModal = (props) => {
  const {intl, onOk, onCancel} = props
  const [wallet, setWallet] = useState(null)
  const [okButtonEnabled, setOkButtonEnabled] = useState(false)

  useEffect(() => {
    const fetchData = () => {
      const newWallet = ethers.Wallet.createRandom()
      setWallet(newWallet)
    }
    fetchData()
  }, [])

  const onAddressCopied = () => {
    openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'copy.address.success'}))
  }

  const onPrivateKeyCopied = () => {
    openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'copy.private.key.success'}))
  }

  const handleOk = () => {
    onOk(wallet)
  }

  const handleCheckBox = (e) => {
    setOkButtonEnabled(e.target.checked)
  }

  const address = wallet ? wallet.address : intl.formatMessage({id: 'unknown'})
  const privateKey = wallet ? wallet.privateKey : intl.formatMessage({id: 'unknown'})

  return (
    <Modal
      visible={true}
      title={intl.formatMessage({id: 'create'})}
      okText={intl.formatMessage({id: 'create'})}
      cancelText={intl.formatMessage({id: 'cancel'})}
      okButtonProps={{disabled: !okButtonEnabled}}
      onOk={handleOk}
      onCancel={onCancel}>
      <Alert className={'gx-m-1'} message={intl.formatMessage({id: 'create.desc'})} type="warning" showIcon/>
      <Input
        className={'gx-m-1'}
        addonBefore={intl.formatMessage({id: 'address'})}
        addonAfter={
          <CopyToClipboard
            text={address}
            onCopy={onAddressCopied}>
            <CopyOutlined/>
          </CopyToClipboard>
        }
        value={address}
        readOnly/>
      <Input
        className={'gx-m-1'}
        addonBefore={intl.formatMessage({id: 'private.key'})}
        addonAfter={
          <CopyToClipboard
            text={privateKey}
            onCopy={onPrivateKeyCopied}>
            <CopyOutlined/>
          </CopyToClipboard>
        }
        value={privateKey}
        readOnly/>
      <Checkbox className={'gx-m-1'} onChange={handleCheckBox}>{intl.formatMessage({id: 'create.saved'})}</Checkbox>
    </Modal>
  )
}

export default injectIntl(WalletCreateModal)

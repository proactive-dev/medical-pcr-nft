import React, { useEffect, useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import { EditFilled, QrcodeOutlined } from '@ant-design/icons'
import { openNotificationWithIcon } from '../../components/Messages'
import { EDIT, ERROR, TYPE_ORGANIZATION } from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { bigNumberArrayToString } from '../../util/helpers'
import OrganizationViewForm from '../../components/OrganizationViewForm'

const OrganizationView = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, match, history} = props
  const {address, contract} = chain
  const [account, setAccount] = useState('')
  const [info, setInfo] = useState({})
  const [qrCodeVisible, setQRCodeVisible] = useState(false)

  useEffect(() => {
    let account = match.params.account
    if (!_.isEmpty(account) && !_.isUndefined(account)) {
      setAccount(account)
      fetchData(account)
    } else if (!_.isEmpty(address)) {
      setAccount(address)
      fetchData(address)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidAddress'}))
    }
  }, [])

  const fetchData = (account) => {
    dispatch(showLoader())
    contract.getOrganization(account).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _info = {
          role: result['role'],
          account,
          name: bigNumberArrayToString(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: bigNumberArrayToString(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: bigNumberArrayToString(result['mail'])
        }
        if (_.isEmpty(_info['name']) || _.isEmpty(_info['phoneNumber']) || _.isEmpty(_info['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
          window.history.back()
        } else {
          setInfo(_info)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const onChange = () => {
    history.push({
      pathname: `/${TYPE_ORGANIZATION}/${EDIT}`,
      state: {info: info}
    })
  }

  const showQRCode = () => {
    setQRCodeVisible(true)
  }

  const closeQRCode = e => {
    setQRCodeVisible(false)
  }

  return (
    <Spin spinning={loader}>
      <Button className="gx-mt-md-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>} onClick={showQRCode}>
        &nbsp;<FormattedMessage id="show.qrcode"/>
      </Button>
      <OrganizationViewForm
        intl={intl}
        info={info}
        account={account}
        showAll={true}
      />
      {
        !_.isEmpty(match.params.account) && !_.isUndefined(match.params.account) &&
        <Button className="gx-mt-4 gx-w-100 gx-btn-outline-primary" type="normal" icon={<EditFilled/>}
                onClick={onChange}>
          &nbsp;<FormattedMessage id="change"/>
        </Button>
      }
      <Modal
        visible={qrCodeVisible}
        footer={null}
        onOk={closeQRCode}
        onCancel={closeQRCode}>
        <div className={'gx-text-center'}>
          <QRCode
            value={account}
            size={200}
            level="H"/>
          <br/>
          <h5 className={'gx-m-2'}>{account}</h5>
        </div>
      </Modal>
    </Spin>
  )
}

export default withRouter(injectIntl(OrganizationView))

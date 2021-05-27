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
import { EDIT, ERROR, TYPE_USER } from '../../constants/AppConfigs'
import { bigNumberArrayToString } from '../../util/helpers'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import UserViewForm from '../../components/UserViewForm'

const UserView = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, history} = props
  const {address, contract} = chain
  const [qrCodeVisible, setQRCodeVisible] = useState(false)
  const [info, setInfo] = useState({})

  useEffect(() => {
    fetchData(address)
  }, [])

  const fetchData = (address) => {
    dispatch(showLoader())
    contract.getPerson(address).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _info = {
          firstName: ethers.utils.parseBytes32String(result['firstName']),
          lastName: ethers.utils.parseBytes32String(result['lastName']),
          residence: bigNumberArrayToString(result['residence']),
          birthDate: ethers.utils.parseBytes32String(result['birth']),
          gender: parseInt(result['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        }
        if (_.isEmpty(_info['firstName']) || _.isEmpty(_info['lastName']) || _.isEmpty(_info['phoneNumber']) || _.isEmpty(_info['email'])) {
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
      pathname: `/${TYPE_USER}/${EDIT}`,
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
      <UserViewForm
        intl={intl}
        info={info}
      />
      <Button className="gx-mt-4 gx-w-100 gx-btn-outline-primary" type="normal" icon={<EditFilled/>} onClick={onChange}>
        &nbsp;<FormattedMessage id="change"/>
      </Button>
      <Modal
        visible={qrCodeVisible}
        footer={null}
        onOk={closeQRCode}
        onCancel={closeQRCode}>
        <div className={'gx-text-center'}>
          <QRCode
            value={address}
            size={200}
            level="H"/>
          <br/>
          <h5 className={'gx-m-2'}>{address}</h5>
        </div>
      </Modal>
    </Spin>
  )
}

export default withRouter(injectIntl(UserView))

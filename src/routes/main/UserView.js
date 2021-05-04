import React, { useEffect, useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Form, Modal, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import QRCode from 'qrcode.react'
import { EditFilled, QrcodeOutlined } from '@ant-design/icons'
import { openNotificationWithIcon } from '../../components/Messages'
import { EDIT, ERROR, TYPE_USER } from '../../constants/AppConfigs'
import { findGender } from '../../util/helpers'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'

const FormItem = Form.Item

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
        setInfo({
          name: ethers.utils.parseBytes32String(result['name']),
          residence: ethers.utils.parseBytes32String(result['residence']),
          birthDate: ethers.utils.parseBytes32String(result['birth']),
          gender: parseInt(result['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        })
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

  const {name, residence, birthDate, gender, phoneNumber, email} = info
  let genderStr = ''
  if (_.isNumber(gender)) {
    genderStr = intl.formatMessage({id: `gender.${findGender(gender)}`})
  }

  return (
    <Spin spinning={loader}>
      <Button className="gx-m-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>} onClick={showQRCode}>
        &nbsp;<FormattedMessage id="show.qrcode"/>
      </Button>
      <Form
        name="register-form"
        layout={'vertical'}>
        <FormItem name="name" label={intl.formatMessage({id: 'name'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{name || ''}</span>
        </FormItem>
        <FormItem name="residence" label={intl.formatMessage({id: 'address'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{residence || ''}</span>
        </FormItem>
        <FormItem name="birthDate" label={intl.formatMessage({id: 'birthDate'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{birthDate || ''}</span>
        </FormItem>
        <FormItem name="gender" label={intl.formatMessage({id: 'gender'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{genderStr}</span>
        </FormItem>
        <FormItem name="phoneNumber" label={intl.formatMessage({id: 'phoneNumber'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{phoneNumber || ''}</span>
        </FormItem>
        <FormItem name="email" label={'Email'}>
          <span className="ant-input gx-mt-1 gx-mb-1">{email || ''}</span>
        </FormItem>
      </Form>
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

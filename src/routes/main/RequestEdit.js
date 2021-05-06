import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, DatePicker, Form, Input, Modal, Select, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import moment from 'moment'
import { isAddress } from '@ethersproject/address'
import { QrcodeOutlined } from '@ant-design/icons'
import QrReader from 'react-qr-reader'
import { COMMON_DATE_FORMAT, ERROR, GENDER, QRREADER_TIMEOUT, SUCCESS } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import ConfirmButton from '../../components/ConfirmButton'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'

const FormItem = Form.Item
const {Option} = Select

const formRef = React.createRef()

const RequestEdit = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {contract} = chain
  const {intl, history} = props
  const [qrCodeModalOpen, setQRCodeModalOpen] = useState(false)

  const saveTestRequest = async (values) => {
    dispatch(showLoader())
    contract.newTestRequest(
      values.account,
      ethers.utils.formatBytes32String(values.name),
      ethers.utils.formatBytes32String(values.birthDate.format(COMMON_DATE_FORMAT)),
      values.gender,
      ethers.utils.formatBytes32String(values.residence),
      ethers.utils.formatBytes32String(values.phoneNumber),
      ethers.utils.formatBytes32String(values.email)
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.request'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const fetchUser = (address) => {
    dispatch(showLoader())
    contract.getPerson(address).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        const _info = {
          account: address,
          name: ethers.utils.parseBytes32String(result['name']),
          residence: ethers.utils.parseBytes32String(result['residence']),
          birthDate: ethers.utils.parseBytes32String(result['birth']),
          gender: parseInt(result['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        }
        if (_.isEmpty(_info['name']) || _.isEmpty(_info['phoneNumber']) || _.isEmpty(_info['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        } else {
          if (_info.birthDate) {
            _info['birthDate'] = moment(_info.birthDate, COMMON_DATE_FORMAT)
          }
          formRef.current.setFieldsValue(_info)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const showQRCodeModal = () => {
    setQRCodeModalOpen(true)
  }

  const closeQRCodeModal = e => {
    setQRCodeModalOpen(false)
  }

  const handleQrCodeScan = (value) => {
    setQRCodeModalOpen(false)
    if (isAddress(value)) {
      formRef.current.setFieldsValue({account: value})
      fetchUser(value)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidAddress'}))
    }
  }

  const handleQrCodeError = (err) => {
    let msg = intl.formatMessage({id: 'alert.qrCodeError'})
    if (!_.isEmpty(err) && !_.isEmpty(err.message)) {
      msg = msg + ':' + err.message
    }
    openNotificationWithIcon(ERROR, msg)
    setQRCodeModalOpen(false)
  }

  return (
    <Spin spinning={loader}>
      <Button className="gx-mt-md-4 gx-btn-primary" type="normal" icon={<QrcodeOutlined/>} onClick={showQRCodeModal}>
        &nbsp;<FormattedMessage id="scan.qrCode"/>
      </Button>
      <Form
        name="request-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={saveTestRequest}>
        <FormItem
          name="account"
          label={intl.formatMessage({id: 'account'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})},
            {
              validator: (_, value) => (!value || isAddress(value)) ?
                Promise.resolve() : Promise.reject(intl.formatMessage({id: 'alert.invalidAddress'}))
            }
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="name"
          label={intl.formatMessage({id: 'name'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="residence"
          label={intl.formatMessage({id: 'address'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="birthDate"
          label={intl.formatMessage({id: 'birthDate'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <DatePicker className="gx-mt-1 gx-mb-1" format={COMMON_DATE_FORMAT}/>
        </FormItem>
        <FormItem
          name="gender"
          label={intl.formatMessage({id: 'gender'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Select className="gx-mt-1 gx-mb-1" allowClear>
            {
              GENDER.map(gender =>
                <Option value={gender.value} key={gender.key}>
                  {intl.formatMessage({id: `gender.${gender.key}`})}
                </Option>
              )
            }
          </Select>
        </FormItem>
        <FormItem
          name="phoneNumber"
          label={intl.formatMessage({id: 'phoneNumber'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="email"
          label={'Email'}
          rules={[
            {type: 'email', message: intl.formatMessage({id: 'alert.invalidEmail'})},
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
      </Form>
      <ConfirmButton intl={intl} form={formRef} btnTitle={'request'} confirmEnabled={true}/>
      {
        qrCodeModalOpen &&
        <Modal
          visible={true}
          footer={null}
          onOk={closeQRCodeModal}
          onCancel={closeQRCodeModal}>
          <div className={'gx-text-center'}>
            <QrReader
              style={{height: 250, width: 250, margin: 'auto'}}
              delay={QRREADER_TIMEOUT}
              onScan={handleQrCodeScan}
              onError={handleQrCodeError}
            />
          </div>
        </Modal>
      }
    </Spin>
  )
}

export default withRouter(injectIntl(RequestEdit))

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { DatePicker, Divider, Form, Input, Select, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import { ERROR, SUCCESS, TEST_RESULT } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import ConfirmButton from '../../components/ConfirmButton'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { findGender } from '../../util/helpers'

const FormItem = Form.Item
const {Option} = Select

const formRef = React.createRef()

const dateFormat = 'DD/MM/YYYY'

const NewCertificate = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract} = chain
  const {intl, match, history} = props
  const [requestId, setRequestId] = useState(null)
  const [request, setRequest] = useState({})
  const [organization, setOrganization] = useState({})

  useEffect(() => {
    let id = match.params.id
    if (!_.isEmpty(id) && !_.isUndefined(id)) {
      setRequestId(id)
      fetchTestRequest(id)
      fetchOrganization()
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.invalidData'}))
    }
  }, [])

  const fetchTestRequest = (id) => {
    dispatch(showLoader())
    contract.getTestRequest(id).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _request = {
          account: result['account'],
          name: ethers.utils.parseBytes32String(result['name']),
          residence: ethers.utils.parseBytes32String(result['residence']),
          birthDate: ethers.utils.parseBytes32String(result['birth']),
          gender: parseInt(result['gender']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        }
        if (_.isEmpty(_request['name']) || _.isEmpty(_request['phoneNumber']) || _.isEmpty(_request['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
          window.history.back()
        } else {
          setRequest(_request)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const fetchOrganization = () => {
    dispatch(showLoader())
    contract.getOrganization(address).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        window.history.back()
      } else {
        const _organization = {
          name: ethers.utils.parseBytes32String(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: ethers.utils.parseBytes32String(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
        }
        if (_.isEmpty(_organization['name']) || _.isEmpty(_organization['phoneNumber']) || _.isEmpty(_organization['email'])) {
          openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
          window.history.back()
        } else {
          setOrganization(_organization)
        }
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const submit = async (values) => {
    // TODO: Export to PDF
    // TODO: Upload to IPFS
    // TODO: Mint request to smart contract
    // await mintRequest(values, fileHash)
  }

  const mintRequest = async (values, fileHash) => {
    dispatch(showLoader())
    contract.mint(
      requestId,
      address,
      ethers.utils.formatBytes32String(values.sample),
      ethers.utils.formatBytes32String(values.collectionMethod),
      ethers.utils.formatBytes32String(values.collectionDate.format(dateFormat)),
      ethers.utils.formatBytes32String(values.testMethod),
      values.testResult,
      ethers.utils.formatBytes32String(values.testResultDate.format(dateFormat)),
      fileHash
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.request'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  let genderStr = ''
  if (_.isNumber(request.gender)) {
    genderStr = intl.formatMessage({id: `gender.${findGender(request.gender)}`})
  }

  return (
    <Spin spinning={loader}>
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.user"/></h3>
      </Divider>
      <Form
        name="user-form"
        layout={'vertical'}>
        <FormItem name="account" label={intl.formatMessage({id: 'account'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.account || ''}</span>
        </FormItem>
        <FormItem name="name" label={intl.formatMessage({id: 'name'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.name || ''}</span>
        </FormItem>
        <FormItem name="residence" label={intl.formatMessage({id: 'address'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.residence || ''}</span>
        </FormItem>
        <FormItem name="birthDate" label={intl.formatMessage({id: 'birthDate'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.birthDate || ''}</span>
        </FormItem>
        <FormItem name="gender" label={intl.formatMessage({id: 'gender'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{genderStr}</span>
        </FormItem>
        <FormItem name="phoneNumber" label={intl.formatMessage({id: 'phoneNumber'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.phoneNumber || ''}</span>
        </FormItem>
        <FormItem name="email" label={'Email'}>
          <span className="ant-input gx-mt-1 gx-mb-1">{request.email || ''}</span>
        </FormItem>
      </Form>
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.test"/></h3>
      </Divider>
      <Form
        name="test-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={submit}>
        <FormItem
          name="sample"
          label={intl.formatMessage({id: 'collection.sample'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="collectionMethod"
          label={intl.formatMessage({id: 'collection.method'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="collectionDate"
          label={intl.formatMessage({id: 'collection.date'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <DatePicker className="gx-mt-1 gx-mb-1" format={dateFormat}/>
        </FormItem>
        <FormItem
          name="testMethod"
          label={intl.formatMessage({id: 'test.method'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="testResult"
          label={intl.formatMessage({id: 'test.result'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Select className="gx-mt-1 gx-mb-1" allowClear>
            {
              TEST_RESULT.map(resultObj =>
                <Option value={resultObj.value} key={resultObj.key}>
                  {intl.formatMessage({id: `test.result.${resultObj.key}`})}
                </Option>
              )
            }
          </Select>
        </FormItem>
        <FormItem
          name="testResultDate"
          label={intl.formatMessage({id: 'test.result.date'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <DatePicker className="gx-mt-1 gx-mb-1" format={dateFormat}/>
        </FormItem>
      </Form>
      <Divider orientation="left">
        <h3 className="gx-text-primary"><FormattedMessage id="information.issuer"/></h3>
      </Divider>
      <Form
        name="organization-form"
        layout={'vertical'}>
        <FormItem name="name" label={intl.formatMessage({id: 'organization.name'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization.name || ''}</span>
        </FormItem>
        <FormItem name="delegateName" label={intl.formatMessage({id: 'organization.delegate'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization.delegateName || ''}</span>
        </FormItem>
        <FormItem name="residence" label={intl.formatMessage({id: 'organization.address'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization.residence || ''}</span>
        </FormItem>
        <FormItem name="phoneNumber" label={intl.formatMessage({id: 'phoneNumber'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization.phoneNumber || ''}</span>
        </FormItem>
        <FormItem name="email" label={'Email'}>
          <span className="ant-input gx-mt-1 gx-mb-1">{organization.email || ''}</span>
        </FormItem>
      </Form>
      <ConfirmButton intl={intl} form={formRef} btnTitle={'mint'} confirmEnabled={true}/>
    </Spin>
  )
}

export default withRouter(injectIntl(NewCertificate))

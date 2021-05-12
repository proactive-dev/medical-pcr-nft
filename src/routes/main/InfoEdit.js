import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { injectIntl } from 'react-intl'
import { DatePicker, Form, Input, Select, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import moment from 'moment'
import { isAddress } from '@ethersproject/address'
import { COMMON_DATE_FORMAT, ERROR, GENDER, SUCCESS, TYPE_ORGANIZATION } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import ConfirmButton from '../../components/ConfirmButton'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'

const FormItem = Form.Item
const {Option} = Select

const formRef = React.createRef()

const InfoEdit = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {address, contract} = chain
  const {intl, history, location, match} = props

  useEffect(() => {
    if (!_.isEmpty(location.state) && !_.isEmpty(location.state.info)) {
      const info = location.state.info
      if (info && info.birthDate) {
        info['birthDate'] = moment(info.birthDate, COMMON_DATE_FORMAT)
      }
      formRef.current.setFieldsValue(info)
    }
  }, [])

  const saveUser = async (values) => {
    dispatch(showLoader())
    contract.setPerson(
      address,
      ethers.utils.formatBytes32String(values.name),
      ethers.utils.formatBytes32String(values.birthDate.format(COMMON_DATE_FORMAT)),
      values.gender,
      ethers.utils.formatBytes32String(values.residence),
      ethers.utils.formatBytes32String(values.phoneNumber),
      ethers.utils.formatBytes32String(values.email)
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.user'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const saveOrganization = (values) => {
    dispatch(showLoader())
    contract.setOrganization(
      values.account,
      ethers.utils.formatBytes32String(values.name),
      ethers.utils.formatBytes32String(values.delegateName),
      ethers.utils.formatBytes32String(values.residence),
      ethers.utils.formatBytes32String(values.phoneNumber),
      ethers.utils.formatBytes32String(values.email)
    ).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.organization'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const getUserForm = () => {
    return (
      <Form
        name="user-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={saveUser}>
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
          label={intl.formatMessage({id: 'phoneNumber.example'})}
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
    )
  }

  const getOrganizationForm = () => {
    return (
      <Form
        name="organization-form"
        layout={'vertical'}
        ref={formRef}
        onFinish={saveOrganization}>
        <FormItem
          name="account"
          label={'ID'}
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
          label={intl.formatMessage({id: 'organization.name'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="delegateName"
          label={intl.formatMessage({id: 'organization.delegate'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="residence"
          label={intl.formatMessage({id: 'organization.address'})}
          rules={[
            {required: true, message: intl.formatMessage({id: 'alert.fieldRequired'})}
          ]}>
          <Input className="gx-mt-1 gx-mb-1" allowClear/>
        </FormItem>
        <FormItem
          name="phoneNumber"
          label={intl.formatMessage({id: 'phoneNumber.example'})}
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
    )
  }

  return (
    <Spin spinning={loader}>
      {
        match.params.type === TYPE_ORGANIZATION ?
          getOrganizationForm()
          :
          getUserForm()
      }
      <ConfirmButton intl={intl} form={formRef} btnTitle={'request'} confirmEnabled={false}/>
    </Spin>
  )
}

export default withRouter(injectIntl(InfoEdit))

import React, { useEffect, useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Form, Spin } from 'antd'
import { withRouter } from 'react-router-dom'
import { ethers } from 'ethers'
import _ from 'lodash'
import { EditFilled } from '@ant-design/icons'
import { openNotificationWithIcon } from '../../components/Messages'
import { EDIT, ERROR, TYPE_ORGANIZATION } from '../../constants/AppConfigs'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'

const FormItem = Form.Item

const OrganizationView = (props) => {
  const dispatch = useDispatch()
  const loader = useSelector(state => state.progress.loader)
  const chain = useSelector(state => state.chain)
  const {intl, match, history} = props
  const {contract} = chain
  const [account, setAccount] = useState('')
  const [info, setInfo] = useState({})

  useEffect(() => {
    let account = match.params.account
    if (!_.isEmpty(account) && !_.isUndefined(account)) {
      setAccount(account)
      fetchData(account)
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
          account,
          name: ethers.utils.parseBytes32String(result['name']),
          delegateName: ethers.utils.parseBytes32String(result['representative']),
          residence: ethers.utils.parseBytes32String(result['streetAddress']),
          phoneNumber: ethers.utils.parseBytes32String(result['phone']),
          email: ethers.utils.parseBytes32String(result['mail'])
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

  const {name, delegateName, residence, phoneNumber, email} = info

  return (
    <Spin spinning={loader}>
      <Form
        name="organization-form"
        layout={'vertical'}>
        <FormItem name="account" label={'ID'}>
          <span className="ant-input gx-mt-1 gx-mb-1">{account || ''}</span>
        </FormItem>
        <FormItem name="name" label={intl.formatMessage({id: 'organization.name'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{name || ''}</span>
        </FormItem>
        <FormItem name="delegateName" label={intl.formatMessage({id: 'organization.delegate'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{delegateName || ''}</span>
        </FormItem>
        <FormItem name="residence" label={intl.formatMessage({id: 'organization.address'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{residence || ''}</span>
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
    </Spin>
  )
}

export default withRouter(injectIntl(OrganizationView))

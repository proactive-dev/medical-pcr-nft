import React from 'react'
import { Form } from 'antd'
import _ from 'lodash'
import { findRole } from '../util/helpers'

const FormItem = Form.Item

const OrganizationViewForm = (props) => {
  const {intl, account, info, showAll} = props
  const {role, name, delegateName, residence, phoneNumber, email} = info
  let roleStr = ''
  if (showAll && _.isNumber(role)) {
    roleStr = intl.formatMessage({id: `role.${findRole(role)}`})
  }

  return (
    <Form
      name="organization-form"
      layout={'vertical'}>
      {
        showAll &&
        <>
          <FormItem name="account" label={'ID'}>
            <span className="ant-input gx-mt-1 gx-mb-1">{account || ''}</span>
          </FormItem>
          <FormItem name="role" label={intl.formatMessage({id: 'role'})}>
            <span className="ant-input gx-mt-1 gx-mb-1">{roleStr || ''}</span>
          </FormItem>
        </>
      }
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
  )
}

export default OrganizationViewForm

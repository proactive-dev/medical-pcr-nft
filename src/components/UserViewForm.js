import React from 'react'
import { Form } from 'antd'
import _ from 'lodash'
import { findGender } from '../util/helpers'

const FormItem = Form.Item

const UserViewForm = (props) => {
  const {intl, info, showId} = props
  const {account, firstName, lastName, residence, birthDate, gender, phoneNumber, email} = info
  let genderStr = ''
  if (_.isNumber(gender)) {
    genderStr = intl.formatMessage({id: `gender.${findGender(gender)}`})
  }

  return (
    <Form
      name="user-form"
      layout={'vertical'}>
      {
        showId &&
        <FormItem name="account" label={'ID'}>
          <span className="ant-input gx-mt-1 gx-mb-1">{account || ''}</span>
        </FormItem>
      }
      <FormItem name="lastName" label={intl.formatMessage({id: 'name'})}>
        <span className="ant-input gx-mt-1 gx-mb-1">{lastName || ''} {firstName || ''}</span>
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
  )
}

export default UserViewForm

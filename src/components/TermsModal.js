import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Button, Modal } from 'antd'
import CustomScrollbars from './CustomScrollbars'
import { TERMS } from '../constants/terms'

const TermsModal = (props) => {
  const {intl, onOk} = props
  return (
    <Modal
      visible={true}
      title={intl.formatMessage({id: 'terms'})}
      footer={null}
      onOk={onOk}>
      <CustomScrollbars style={{height: 500}}>
        <div dangerouslySetInnerHTML={{__html: TERMS}}/>
        <Button className="gx-mt-4 login-form-button" type="primary" onClick={onOk}>
          <FormattedMessage id={'agree'}/>
        </Button>
      </CustomScrollbars>
    </Modal>
  )
}

export default injectIntl(TermsModal)

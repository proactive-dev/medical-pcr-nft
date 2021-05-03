import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { FormattedMessage, injectIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { Button, Form, Image } from 'antd'
import _ from 'lodash'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { openNotificationWithIcon } from '../../components/Messages'
import { ERROR, SUCCESS } from '../../constants/AppConfigs'
import { sendContractMethod } from '../../util/web3Handler'
import { ipfsLink } from '../../util/helpers'

const FormItem = Form.Item

const DeedDetail = (props) => {
  const {intl, history, web3, contract, connectedAccount, match} = props
  const dispatch = useDispatch()
  const [id, setId] = useState(null)
  const [info, setInfo] = useState({})

  useEffect(() => {
    let id = match.params.id
    if (!_.isEmpty(id) && !_.isUndefined(id)) {
      setId(id)
      getDeed(id)
    }
  }, [])

  const getDeed = (id) => {
    dispatch(showLoader())
    contract.methods.getDeed(id).call({from: connectedAccount.address}).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result['name'])) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
        history.push('/')
      } else {
        setInfo(result)
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
      window.history.back()
    })
  }

  const handleBurn = () => {
    dispatch(showLoader())
    const contractData = contract.methods.burn(id)
    sendContractMethod({web3, account: connectedAccount, contractData}).then((result) => {
      dispatch(hideLoader())
      openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.burn'}))
      history.push('/')
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const {name, description, fileHash, imageHash} = info
  return (
    <div>
      <Form
        className={'gx-p-3'}
        name="register-form"
        layout={'vertical'}>
        <FormItem name="name" label={intl.formatMessage({id: 'name'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{name || ''}</span>
        </FormItem>
        <FormItem name="description" label={intl.formatMessage({id: 'description'})}>
          <span className="ant-input gx-mt-1 gx-mb-1">{description || ''}</span>
        </FormItem>
        <FormItem name="image" label={intl.formatMessage({id: 'image'})}>
          <Image className="gx-mt-1 gx-mb-1" src={ipfsLink(imageHash)} alt={intl.formatMessage({id: 'image'})}/>
        </FormItem>
        <FormItem name="fileHash" label={intl.formatMessage({id: 'file.hash'})}>
          <a className="gx-link gx-text-underline" href={ipfsLink(fileHash)} target="_blank" rel="noopener noreferrer">
            {fileHash}
          </a>
        </FormItem>
      </Form>
      <Button className="gx-w-100 gx-btn-outline-primary" type="normal" onClick={handleBurn}>
        <FormattedMessage id="burn"/>
      </Button>
    </div>
  )
}

export default withRouter(injectIntl(DeedDetail))

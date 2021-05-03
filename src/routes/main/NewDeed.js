import React, { useState } from 'react'
import { injectIntl } from 'react-intl'
import { useDispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Steps } from 'antd'
import { ERROR, SUCCESS } from '../../constants/AppConfigs'
import { openNotificationWithIcon } from '../../components/Messages'
import IPFSUpload from '../../components/IPFSUpload'
import MintForm from '../../components/MintForm'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { uploadIPFS } from '../../util/helpers'
import { sendContractMethod } from '../../util/web3Handler'

const {Step} = Steps

const titles = [
  'upload', 'mint'
]

const NewDeed = (props) => {
  const {intl, history, ipfs, web3, contract, connectedAccount} = props
  const dispatch = useDispatch()
  const [current, setCurrent] = useState(0)
  const [fileHash, setFileHash] = useState(null)

  const handleUpload = async (file) => {
    dispatch(showLoader())
    const fileHash = await uploadIPFS({ipfs, file})
    dispatch(hideLoader())
    if (fileHash) {
      setFileHash(fileHash)
      setCurrent(current + 1)
    } else {
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.fail2UploadIPFS'}))
    }
  }

  const handleMint = async (values) => {
    dispatch(showLoader())
    const imageHash = await uploadIPFS({ipfs, file: values.images[0]})
    if (imageHash) {
      const contractData = contract.methods.mint(values.name, values.description, fileHash, imageHash)
      sendContractMethod({web3, account: connectedAccount, contractData}).then((result) => {
        dispatch(hideLoader())
        openNotificationWithIcon(SUCCESS, intl.formatMessage({id: 'alert.success.mint'}))
        history.push('/')
      }).catch((error) => {
        dispatch(hideLoader())
        openNotificationWithIcon(ERROR, error.message)
      })
    } else {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.fail2UploadIPFS'}))
    }
  }

  return (
    <>
      <Steps current={current}>
        {titles.map(title => (
          <Step key={title} title={intl.formatMessage({id: title})}/>
        ))}
      </Steps>
      <div className="gx-mt-4">
        {
          current === 0 &&
          <IPFSUpload onSubmit={handleUpload}/>
        }
        {
          current === 1 &&
          <MintForm
            {...props}
            fileHash={fileHash}
            onSubmit={handleMint}
          />
        }
      </div>
    </>
  )
}

export default withRouter(injectIntl(NewDeed))

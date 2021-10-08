import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Col, Layout, Row } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import Torus from '@toruslabs/torus-embed'
import _ from 'lodash'
import {
  CHAIN_ID,
  CONTRACT_CERT_ADDRESS,
  CONTRACT_OWNER_KEY,
  CONTRACT_STORAGE_ADDRESS,
  COPYRIGHT_COMPANY,
  ERROR,
  RPC_PROVIDER
} from '../../constants/AppConfigs'
import { NAV_STYLE_DRAWER, NAV_STYLE_FIXED, NAV_STYLE_MINI_SIDEBAR, TAB_SIZE } from '../../constants/ThemeSetting'
import PCRStorage from '../../artifacts/contracts/PCRStorage.sol/PCRStorage.json'
import PCRCertificate from '../../artifacts/contracts/PCRCertificate.sol/PCRCertificate.json'
import Sidebar from '../Sidebar/index'
import TopBar from '../../components/TopBar'
import { openNotificationWithIcon } from '../../components/Messages'
import { hideLoader, showLoader } from '../../appRedux/actions/Progress'
import { setContract, setIPFS, setRoles } from '../../appRedux/actions/Chain'
import MainRoute from './MainRoute'

const {Content, Footer} = Layout

const providerOptions = {
  torus: {
    package: Torus,
    options: {
      networkParams: {
        host: RPC_PROVIDER,
        chainId: CHAIN_ID,
        networkId: CHAIN_ID
      }
    }
  }
}

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions // required
  })
}

const MainApp = (props) => {
  const {intl} = props
  const dispatch = useDispatch()
  const settings = useSelector(state => state.settings)
  const loader = useSelector(state => state.progress.loader)
  const {navStyle, width} = settings
  const [connected, setConnected] = useState(false)
  const [web3Provider, setWeb3Provider] = useState()

  const connect = useCallback(async function () {
    web3Modal.clearCachedProvider()
    const provider = await web3Modal.connect()

    const web3Provider = new ethers.providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    let owner = new ethers.Wallet(CONTRACT_OWNER_KEY)
    owner = owner.connect(web3Provider)
    const certContract = new ethers.Contract(CONTRACT_CERT_ADDRESS, PCRCertificate.abi, owner)
    const contract = new ethers.Contract(CONTRACT_STORAGE_ADDRESS, PCRStorage.abi, owner)
    // Get user address
    const address = await signer.getAddress()

    dispatch(setContract({contract, certContract, address}))
    getRoles({contract, address})
    setWeb3Provider(web3Provider)
  }, [])

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider()
      if (web3Provider?.disconnect && typeof web3Provider.disconnect === 'function') {
        await web3Provider.disconnect()
      }
      dispatch(setContract({contract: null, certContract: null, address: null}))
    },
    [web3Provider]
  )

  useEffect(() => {
    dispatch(setIPFS(ipfs))
  }, [])

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  useEffect(() => {
    if (web3Provider?.on) {
      const handleAccountsChanged = (accounts) => {
        dispatch(setContract({address: accounts[0].address}))
      }

      const handleDisconnect = (error) => {
        disconnect()
      }

      web3Provider.on('accountsChanged', handleAccountsChanged)
      web3Provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (web3Provider.removeListener) {
          web3Provider.removeListener('accountsChanged', handleAccountsChanged)
          web3Provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [web3Provider, disconnect])

  const getRoles = ({contract, address}) => {
    dispatch(showLoader())
    contract.getRoles(address).then((result) => {
      dispatch(hideLoader())
      if (_.isEmpty(result)) {
        openNotificationWithIcon(ERROR, intl.formatMessage({id: 'alert.emptyData'}))
      } else {
        dispatch(setRoles({isAdmin: result[0], isIssuer: result[1], isBusiness: result[2]}))
        setConnected(true)
      }
    }).catch((error) => {
      dispatch(hideLoader())
      openNotificationWithIcon(ERROR, error.message)
    })
  }

  const getSidebar = () => {
    if (width < TAB_SIZE) {
      return <Sidebar/>
    }
    switch (navStyle) {
      case NAV_STYLE_FIXED :
        return <Sidebar/>
      case NAV_STYLE_DRAWER :
        return <Sidebar/>
      case NAV_STYLE_MINI_SIDEBAR :
        return <Sidebar/>
      default :
        return null
    }
  }

  return (
    <Layout className="gx-app-layout">
      {getSidebar()}
      <Layout>
        <TopBar/>
        <Content className="gx-layout-content gx-container-wrap">
          <div className="gx-main-content-wrapper">
            {
              (web3Provider && connected) ?
                <MainRoute/>
                :
                <Fragment>
                  <Alert message={intl.formatMessage({id: 'alert.connectAccount'})} type="warning" showIcon/>
                  <Row className="gx-m-3 gx-p-2">
                    <Col span={8} xxl={8} xl={8} lg={8} md={12} sm={12} xs={24}>
                      <Button className="login-form-button" size="large" type="primary" loading={loader}
                              onClick={connect}>
                        <FormattedMessage id="connect"/>
                      </Button>
                    </Col>
                  </Row>
                </Fragment>
            }
          </div>
          <Footer>
            <div className="gx-layout-footer-content">
              © {new Date().getFullYear()} {COPYRIGHT_COMPANY}
            </div>
          </Footer>
        </Content>
      </Layout>
    </Layout>
  )
}

export default injectIntl(MainApp)

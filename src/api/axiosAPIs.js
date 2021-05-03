import axios from 'axios'
import * as axiosConfig from './axiosConfig'

const getHeaders = {
  // 'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json; charset=utf-8'
}

const formDataHeaders = {
  // 'Access-Control-Allow-Origin': '*',
  'Content-Type': 'multipart/form-data'
}

const jsonHeaders = {
  // 'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
}

export const axiosRequest = (method, url, reqData = null, needLoader = true) => {
  let reqConfig = {
    url: url,
    method: method,
    baseURL: axiosConfig.HOST_URL,
    // withCredentials: true,
    needLoader: needLoader, // custom config for show loader
    headers: getHeaders // default: get
  }
  if (method === 'post' || method === 'put' || method === 'patch') {
    const headers = reqData instanceof FormData ? formDataHeaders : jsonHeaders
    reqConfig['data'] = reqData
    reqConfig['headers'] = headers
  } else { // 'get', 'delete', 'head'
    reqConfig['params'] = reqData
  }
  return axios.request(reqConfig)
}

export const getAddressInfo = (address) => {
  return axiosRequest('get', `${axiosConfig.ADDRESS_INFO_URL}/${address}`, null)
}

export const getTransactions = (address, limit = 10, offset = 0) => {
  return axiosRequest('get', `${axiosConfig.TRANSACTIONS_URL}/${address}`, null)
  // return axiosRequest('get', `${axiosConfig.TRANSACTIONS_URL}/${address}`, {limit: limit, offset: limit})
}

export const getTokenBalances = (address) => {
  return axiosRequest('get', `${axiosConfig.TOKEN_BALANCES_URL}/${address}`, null)
}

export const getContractInfo = (address) => {
  return axiosRequest('get', `${axiosConfig.CONTRACT_INFO_URL}/${address}`, null)
}

export const getContractTransfers = (address, limit = 10, offset = 0) => {
  return axiosRequest('get', `${axiosConfig.CONTRACT_TRANSFERS_URL}/${address}`, null)
}

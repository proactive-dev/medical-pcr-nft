export const COPYRIGHT_COMPANY = 'Xyon, Inc. All Rights Reserved.'
export const PROJECT_NAME = 'PCR PASS'
export const STORAGE_KEY = 'xy-pcr-pass'

export const LANGUAGES = [
  {
    code: 'ja',
    name: '日本語'
  },
  {
    code: 'en',
    name: 'English'
  }
]

// Notification constants
export const SUCCESS = 'success'
export const ERROR = 'error'
export const NOTIFICATION_TIMEOUT = 5 // seconds
export const QRREADER_TIMEOUT = 5000 // miliseconds

export const COMMON_DATE_FORMAT = 'DD/MM/YYYY'

export const DEFAULT_PRECISION = 2
export const DEFAULT_DECIMALS = 18

export const RPC_PROVIDER = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_RPC_PROVIDER_PROD : process.env.REACT_APP_RPC_PROVIDER_LOCAL
export const CONTRACT_ADDRESS = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_CONTRACT_ADDRESS_PROD : process.env.REACT_APP_CONTRACT_ADDRESS_LOCAL
export const CONTRACT_OWNER_KEY = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_PRIV_KEY_PROD : process.env.REACT_APP_PRIV_KEY_LOCAL

export const NEW = 'new'
export const EDIT = 'edit'
export const VIEW = 'view'
export const LIST = 'list'
export const CERTIFICATE = 'certificate'
export const REQUEST = 'request'
export const TYPE_USER = 'user'
export const TYPE_ORGANIZATION = 'organization'
export const FILTER_ME = 'me'
export const FILTER_ALL = 'all'

export const GENDER = [
  {
    key: 'male', value: 0
  },
  {
    key: 'female', value: 1
  }
]

export const TEST_RESULT = [
  {
    key: 'negative', value: 0
  },
  {
    key: 'positive', value: 1
  }
]

export const USER_MENUS = [
  {
    path: `${TYPE_USER}/${EDIT}`,
    title: 'register.me'
  },
  {
    path: `${TYPE_USER}/${VIEW}`,
    title: 'view.me'
  },
  {
    path: `${CERTIFICATE}/${LIST}/${FILTER_ME}`,
    title: 'view.my.cert'
  }
]

export const ADMIN_MENUS = [
  {
    path: `${TYPE_ORGANIZATION}/${LIST}`,
    title: 'organizations'
  },
  {
    path: `${TYPE_ORGANIZATION}/${EDIT}`,
    title: 'register.organization'
  }
]

export const ISSUER_MENUS = [
  {
    path: `${REQUEST}/${NEW}`,
    title: 'test.request'
  },
  {
    path: `${REQUEST}/${LIST}`,
    title: 'issue.certificate.title'
  },
  {
    path: `${CERTIFICATE}/${LIST}/${FILTER_ALL}`,
    title: 'view.all.cert'
  }
]

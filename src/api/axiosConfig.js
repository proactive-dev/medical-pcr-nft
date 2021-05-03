/**
 * Axios related configurations here
 */

const PRODUCTION_URL = 'http://eth-db.xyon.xyz'
export const HOST_URL = process.env.NODE_ENV === 'production' ? `${PRODUCTION_URL}:8443` : 'http://localhost:3001'

export const ADDRESS_INFO_URL = `${HOST_URL}/address`
export const TRANSACTIONS_URL = `${HOST_URL}/transactions`
export const TOKEN_BALANCES_URL = `${HOST_URL}/token_balances`
export const CONTRACT_INFO_URL = `${HOST_URL}/contract`
export const CONTRACT_TRANSFERS_URL = `${HOST_URL}/contract_transfers`

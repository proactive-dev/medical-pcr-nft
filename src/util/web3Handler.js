import { CONTRACT_ADDRESS, RPC_PROVIDER } from '../constants/AppConfigs'

export const sendContractMethod = async ({web3, account, contractData}) => {
  try {
    if (account.privateKey) {
      const tx = {
        // this could be provider.addresses[0] if it exists
        from: account.address,
        // target address, this could be a smart contract address
        to: CONTRACT_ADDRESS,
        // optional if you want to specify the gas limit
        gas: web3.utils.toHex(3000000),
        // optional if you are invoking say a payable function
        // value: value,
        // this encodes the ABI of the method and the arguments
        data: contractData.encodeABI()
      }
      const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey)
      return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).then((result) => {
          resolve(result)
        }).catch((error) => {
          console.log('error', error)
          reject(error)
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        contractData.send({from: account.address}).then((result) => {
          resolve(result)
        }).catch((error) => {
          console.log('error', error)
          reject(error)
        })
      })
    }
  } catch (error) {
    console.log('error', error)
    return Promise.reject(error)
  }
}

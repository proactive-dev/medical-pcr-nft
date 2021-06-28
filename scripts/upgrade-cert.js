// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require('hardhat')

async function main() {
  const accounts = await ethers.getSigners()
  const owner = await accounts[0].getAddress()
  const storageAddress = process.env.REACT_APP_STORAGE_ADDRESS
  console.log('Storage Contract Address', storageAddress)
  if (storageAddress === null) {
    return
  }
  const deployedStorage = await ethers.getContractAt('PCRStorage', storageAddress)

  console.log('Deploying Certificate.....')
  const certificateFactory = await ethers.getContractFactory('PCRCertificate')
  const deployedCertificate = await certificateFactory.deploy()
  await deployedCertificate.deployed()
  let tx = deployedCertificate.deployTransaction
  let result = await tx.wait()
  if (!result.status) {
    console.log('Deploying Certificate TRANSACTION FAILED!!! ---------------')
    console.log('Transaction hash:' + tx.hash)
    throw (Error('failed to deploy Certificate'))
  }
  console.log('Certificate deploy transaction hash:' + tx.hash)
  console.log('Certificate deployed to:', deployedCertificate.address)

  console.log('Configuring storage in Certificate.....')
  tx = await deployedCertificate.setStorage(deployedStorage.address)
  result = await tx.wait()
  if (!result.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Storage configured in Certificate: transaction hash:' + tx.hash)

  console.log('Configuring certificate as admin in Storage.....')
  tx = await deployedStorage.setAdmin(deployedCertificate.address)
  result = await tx.wait()
  if (!result.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Certificate set as admin in Storage: transaction hash:' + tx.hash)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

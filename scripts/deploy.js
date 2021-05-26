// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {ethers} = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners()
  const owner = await accounts[0].getAddress()

  console.log('Deploying Storage.....')
  const storageFactory = await ethers.getContractFactory('PCRStorage')
  const deployedStorage = await storageFactory.deploy()
  await deployedStorage.deployed()
  let tx = deployedStorage.deployTransaction
  let result = await tx.wait()
  if (!result.status) {
    console.log('Deploying Storage TRANSACTION FAILED!!! ---------------')
    console.log('Transaction hash:' + tx.hash)
    throw (Error('failed to deploy Storage'))
  }
  console.log('Storage deploy transaction hash:' + tx.hash)
  console.log('Storage deployed to:', deployedStorage.address)

  console.log('Deploying Certificate.....')
  const certificateFactory = await ethers.getContractFactory('PCRCertificate')
  const deployedCertificate = await certificateFactory.deploy()
  await deployedCertificate.deployed()
  tx = deployedCertificate.deployTransaction
  result = await tx.wait()
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
    console.error(error);
    process.exit(1);
  });

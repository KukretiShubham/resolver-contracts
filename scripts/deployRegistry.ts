import { ethers } from 'hardhat'

async function main() {
	const registryContract = await ethers.getContractFactory('Registry')
	const registry = await registryContract.deploy()

	console.log('Example address:', registry.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
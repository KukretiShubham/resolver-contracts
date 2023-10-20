import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { solidity } from 'ethereum-waffle'

use(solidity)

describe('Registry', () => {
	describe('createNewRegistry', () => {
		describe('success', () => {
			it('creates initialises registry for owner', async () => {
				const [owner, delg1, delg2, delg3, delg4] = await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await expect(
					await registryContract.createNewRegistry(owner.address, [
						delg1.address,
						delg2.address,
						delg3.address,
						delg4.address,
					])
				)
					.to.emit(registry, 'RegistryCreated')
					.withArgs(
						owner.address,
						delg1.address,
						delg2.address,
						delg3.address,
						delg4.address
					)
			})
		})
		describe('failure', () => {
			it('fails if not called by owner', async () => {
				const [owner, delg1, delg2, delg3, delg4] = await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await expect(
					registryContract
						.connect(delg1)
						.createNewRegistry(owner.address, [
							delg1.address,
							delg2.address,
							delg3.address,
							delg4.address,
						])
				).to.be.revertedWith('Not authorized')
			})
		})
	})
	describe('deleGateVote', () => {
		describe('success', () => {
			it('calls deleGateVote', async () => {
				const [owner, delg1, delg2, delg3, delg4, newWallet] =
					await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await registryContract.createNewRegistry(owner.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
				await expect(
					await registryContract
						.connect(delg1)
						.deleGateVote([owner.address, newWallet.address], delg1.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg1.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)
				await expect(
					await registryContract
						.connect(delg2)
						.deleGateVote([owner.address, newWallet.address], delg2.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg2.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)
				await expect(
					await registryContract
						.connect(delg3)
						.deleGateVote([owner.address, newWallet.address], delg3.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg3.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(true)
				await expect(
					await registryContract
						.connect(delg4)
						.deleGateVote([owner.address, newWallet.address], delg4.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg4.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(true)
			})
		})
		describe('failure', () => {
			it('when not called by delegate', async () => {
				const [owner, delg1, delg2, delg3, delg4, newWallet, delattacker] =
					await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await registryContract.createNewRegistry(owner.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
				await expect(
					registryContract
						.connect(delattacker)
						.deleGateVote([owner.address, newWallet.address], delg1.address)
				).to.be.revertedWith('Not authorized')
			})
			it('fails when delegate is voting for other', async () => {
				const [owner, delg1, delg2, delg3, delg4, newWallet] =
					await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await registryContract.createNewRegistry(owner.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
				await expect(
					registryContract
						.connect(delg2)
						.deleGateVote([owner.address, newWallet.address], delg1.address)
				).to.be.revertedWith('Cant Vote for others')
			})
		})
	})
	describe('updateOldToNew', () => {
		describe('success', () => {
			it('updates old to new', async () => {
				// Get votes from 3 delegates minimum
				const [owner, delg1, delg2, delg3, delg4, newWallet] =
					await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await registryContract.createNewRegistry(owner.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
				await expect(
					await registryContract
						.connect(delg1)
						.deleGateVote([owner.address, newWallet.address], delg1.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg1.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)
				await expect(
					await registryContract
						.connect(delg2)
						.deleGateVote([owner.address, newWallet.address], delg2.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg2.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)
				await expect(
					await registryContract
						.connect(delg3)
						.deleGateVote([owner.address, newWallet.address], delg3.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg3.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(true)
				await expect(
					await registryContract
						.connect(delg4)
						.deleGateVote([owner.address, newWallet.address], delg4.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg4.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(true)

				// Now update wallet
				await expect(
					await registryContract
						.connect(owner)
						.updateOldToNew([owner.address, newWallet.address])
				)
					.to.emit(registry, 'WalletMapped')
					.withArgs(owner.address, newWallet.address)
			})
		})
		describe('failure', () => {
			it('fails when not enough votes', async () => {
				// Get votes from 3 delegates minimum
				const [owner, delg1, delg2, delg3, delg4, newWallet] =
					await ethers.getSigners()
				const registry = await ethers.getContractFactory('Registry')
				const registryContract = await registry.deploy()
				await registryContract.deployed()
				await registryContract.createNewRegistry(owner.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
				await expect(
					await registryContract
						.connect(delg1)
						.deleGateVote([owner.address, newWallet.address], delg1.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg1.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)
				await expect(
					await registryContract
						.connect(delg2)
						.deleGateVote([owner.address, newWallet.address], delg2.address)
				)
					.to.emit(registry, 'Voted')
					.withArgs(owner.address, newWallet.address, delg2.address)
				expect(
					await registryContract.voteValidation([
						owner.address,
						newWallet.address,
					])
				).to.equal(false)

				await expect(
					registryContract
						.connect(owner)
						.updateOldToNew([owner.address, newWallet.address])
				).to.be.revertedWith('Min 3/4 votes required')
			})
		})
	})
	describe('resolver', () => {
		it('resolves address', async () => {
			// Get votes from 3 delegates minimum
			const [owner, delg1, delg2, delg3, delg4, newWallet, newToNewWallet] =
				await ethers.getSigners()
			const registry = await ethers.getContractFactory('Registry')
			const registryContract = await registry.deploy()
			await registryContract.deployed()
			await registryContract.createNewRegistry(owner.address, [
				delg1.address,
				delg2.address,
				delg3.address,
				delg4.address,
			])
			await expect(
				await registryContract
					.connect(delg1)
					.deleGateVote([owner.address, newWallet.address], delg1.address)
			)
				.to.emit(registry, 'Voted')
				.withArgs(owner.address, newWallet.address, delg1.address)
			expect(
				await registryContract.voteValidation([
					owner.address,
					newWallet.address,
				])
			).to.equal(false)
			await expect(
				await registryContract
					.connect(delg2)
					.deleGateVote([owner.address, newWallet.address], delg2.address)
			)
				.to.emit(registry, 'Voted')
				.withArgs(owner.address, newWallet.address, delg2.address)
			expect(
				await registryContract.voteValidation([
					owner.address,
					newWallet.address,
				])
			).to.equal(false)
			await expect(
				await registryContract
					.connect(delg3)
					.deleGateVote([owner.address, newWallet.address], delg3.address)
			)
				.to.emit(registry, 'Voted')
				.withArgs(owner.address, newWallet.address, delg3.address)
			expect(
				await registryContract.voteValidation([
					owner.address,
					newWallet.address,
				])
			).to.equal(true)
			await expect(
				await registryContract
					.connect(delg4)
					.deleGateVote([owner.address, newWallet.address], delg4.address)
			)
				.to.emit(registry, 'Voted')
				.withArgs(owner.address, newWallet.address, delg4.address)
			expect(
				await registryContract.voteValidation([
					owner.address,
					newWallet.address,
				])
			).to.equal(true)

			// Now update wallet
			await expect(
				await registryContract
					.connect(owner)
					.updateOldToNew([owner.address, newWallet.address])
			)
				.to.emit(registry, 'WalletMapped')
				.withArgs(owner.address, newWallet.address)

			// Now resolve
			expect(await registryContract.resolver(owner.address)).to.equal(
				newWallet.address
			)

			// Now update again for new wallet-------

			await registryContract
				.connect(newWallet)
				.createNewRegistry(newWallet.address, [
					delg1.address,
					delg2.address,
					delg3.address,
					delg4.address,
				])
			await expect(
				await registryContract
					.connect(delg1)
					.deleGateVote(
						[newWallet.address, newToNewWallet.address],
						delg1.address
					)
			)
				.to.emit(registry, 'Voted')
				.withArgs(newWallet.address, newToNewWallet.address, delg1.address)
			expect(
				await registryContract.voteValidation([
					newWallet.address,
					newToNewWallet.address,
				])
			).to.equal(false)
			await expect(
				await registryContract
					.connect(delg2)
					.deleGateVote(
						[newWallet.address, newToNewWallet.address],
						delg2.address
					)
			)
				.to.emit(registry, 'Voted')
				.withArgs(newWallet.address, newToNewWallet.address, delg2.address)
			expect(
				await registryContract.voteValidation([
					newWallet.address,
					newToNewWallet.address,
				])
			).to.equal(false)
			await expect(
				await registryContract
					.connect(delg3)
					.deleGateVote(
						[newWallet.address, newToNewWallet.address],
						delg3.address
					)
			)
				.to.emit(registry, 'Voted')
				.withArgs(newWallet.address, newToNewWallet.address, delg3.address)
			expect(
				await registryContract.voteValidation([
					newWallet.address,
					newToNewWallet.address,
				])
			).to.equal(true)
			await expect(
				await registryContract
					.connect(delg4)
					.deleGateVote(
						[newWallet.address, newToNewWallet.address],
						delg4.address
					)
			)
				.to.emit(registry, 'Voted')
				.withArgs(newWallet.address, newToNewWallet.address, delg4.address)
			expect(
				await registryContract.voteValidation([
					newWallet.address,
					newToNewWallet.address,
				])
			).to.equal(true)

			// Now update wallet
			await expect(
				await registryContract
					.connect(newWallet)
					.updateOldToNew([newWallet.address, newToNewWallet.address])
			)
				.to.emit(registry, 'WalletMapped')
				.withArgs(newWallet.address, newToNewWallet.address)

			// Now resolve
			expect(await registryContract.resolver(newWallet.address)).to.equal(
				newToNewWallet.address
			)
			expect(await registryContract.resolver(owner.address)).to.equal(
				newToNewWallet.address
			)
		})
	})
})

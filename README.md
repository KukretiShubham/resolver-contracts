# template-repos-ts-sol

# Testing Wallets for Wallet Resolver

## Old wallet

`0xe12FA3b3E5AC055d2e309C674dA579a09f453552`

## Delegates

`0x1a4E32C54B9c29cAA91d15e4A50F76180d3b5D3c`

`0x0357b9C410e28c6F24823391ba8b580b4b27aed0`

`0x73199dd4F31F35BC8D8138B3c98e0Ff4A24C7dBA`

`0x391c990a006e34970DC5a449E14Aeb8183b1572a`

## New Wallet

`0x1440676bc2990E0EA28dF90253F10435610da83D`

# Installation

```bash
yarn
```

# Verifying a deployed contracts

## For a contract with no constructor arguments

Run hardhat-etherscan

```bash
yarn hardhat verify --network <NETWORK_NAME> <CONTRACT_ADDRESS>
```

## For a contract with constructor arguments

1. Create an arguments declaration file

```js
// cat ./scripts/arguments.js
module.exports = [
	'arguments 1',
	'arguments 2',
	'arguments 3',
	...
]
```

2. Run hardhat-etherscan

```bash
yarn hardhat verify --network <NETWORK_NAME> <CONTRACT_ADDRESS> --contract <PATH_TO_CONTRACT>:<CONTRACT_NAME> --constructor-args ./scripts/arguments.js
```

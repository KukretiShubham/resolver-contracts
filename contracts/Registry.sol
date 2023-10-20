// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

contract Registry {
	error NotAuthorised();

	event RegistryCreated(
		address indexed currWallet,
		address indexed firDel,
		address indexed secDel,
		address thirDel,
		address fourDel
	);
	event WalletMapped(address indexed oldWallet, address indexed newWallet);
	event Voted(address indexed oldWallet, address indexed newWallet, address indexed delegateVoter);

	struct Registery {
		address firDel;
		address secDel;
		address thirDel;
		address fourDel;
	}

	struct Pair{
		address oldWallet;
		address newWallet;
	}

	mapping(address => Registery) public register;
	mapping(address => address) public walletStatusOldToNew;
	// client wallet to mapping(delegate wallet to bool)
	mapping(address => mapping(address => Pair)) public delegateVoteCount;

	// signature verifier as a modifier yet to added
	modifier verifiedByOwner(address currWallet) {
		// solhint-disable-next-line custom-errors
		require(msg.sender == currWallet, "Not authorized");
		_;
	}

	function voteValidation(Pair memory pair) public view returns (bool) {
		uint8 totalVote = 0;

		if (delegateVoteCount[pair.oldWallet][register[pair.oldWallet].firDel].newWallet == pair.newWallet) {
			totalVote += 1;
		}

		if (delegateVoteCount[pair.oldWallet][register[pair.oldWallet].secDel].newWallet == pair.newWallet) {
			totalVote += 1;
		}

		if (delegateVoteCount[pair.oldWallet][register[pair.oldWallet].thirDel].newWallet == pair.newWallet) {
			totalVote += 1;
		}

		if (delegateVoteCount[pair.oldWallet][register[pair.oldWallet].fourDel].newWallet == pair.newWallet) {
			totalVote += 1;
		}

		return totalVote >= 3;
	}

	function createNewRegistry(
		address currWallet,
		Registery memory delegates
	) public verifiedByOwner(currWallet) {
		register[currWallet] = delegates;
		emit RegistryCreated(
			currWallet,
			delegates.firDel,
			delegates.secDel,
			delegates.thirDel,
			delegates.fourDel
		);
	}

	function updateOldToNew(
		Pair memory pair
	) public verifiedByOwner(pair.oldWallet) {
		// solhint-disable-next-line custom-errors
		require(voteValidation(pair), "Min 3/4 votes required");
		walletStatusOldToNew[pair.oldWallet] = pair.newWallet;
		emit WalletMapped(pair.oldWallet, pair.newWallet);
	}

	function deleGateVote(
		Pair memory pair,
		address signer
	) public {
		// solhint-disable-next-line custom-errors
		require(
			msg.sender == register[pair.oldWallet].firDel ||
				msg.sender == register[pair.oldWallet].secDel ||
				msg.sender == register[pair.oldWallet].thirDel ||
				msg.sender == register[pair.oldWallet].fourDel,
			"Not authorized"
		);
		// solhint-disable-next-line custom-errors
		require(msg.sender == signer, "Cant Vote for others");
		// solhint-disable-next-line custom-errors
		require(delegateVoteCount[pair.oldWallet][signer].newWallet == address(0), "Already voted");
		delegateVoteCount[pair.oldWallet][signer] = pair;
		emit Voted(pair.oldWallet, pair.newWallet, signer);
	}

	function resolver(address currWallet) public view returns (address) {
		// this should check if there is a new wallet mapped to the old wallet
		// keep checking until it finds the final wallet
		if (walletStatusOldToNew[currWallet] != address(0)) {
			return resolver(walletStatusOldToNew[currWallet]);
		} else {
			return currWallet;
		}
	}
}

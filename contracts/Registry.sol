// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;


contract Registry {

    error NotAuthorised();

    event RegistryCreated (address indexed currWallet, address indexed firDel, address indexed secDel, address thirDel, address fourDel);
    event WalletMapped (address indexed oldWallet, address indexed newWallet);
    event Voted (address indexed currWallet, address indexed delegateVoter);

    struct Registery{
        address firDel;
        address secDel;
        address thirDel;
        address fourDel;
    }
    mapping (address => Registery) public register;
    mapping (address => address) public walletStatusOldToNew;
    // client wallet to mapping(delegate wallet to bool)
    mapping(address => mapping (address => bool)) public delegateVoteCount;

    // signature verifier as a modifier yet to added
    modifier verifiedByOwner(address currWallet) {
        // solhint-disable-next-line custom-errors
        require(msg.sender == currWallet, "Not authorized");
        _;
    }

    function voteValidation(address currWallet) public view returns (bool) {
    uint8 totalVote = 0;
    
    if (delegateVoteCount[currWallet][register[currWallet].firDel]) {
        totalVote += 1;
    }
    
    if (delegateVoteCount[currWallet][register[currWallet].secDel]) {
        totalVote += 1;
    }
    
    if (delegateVoteCount[currWallet][register[currWallet].thirDel]) {
        totalVote += 1;
    }
    
    if (delegateVoteCount[currWallet][register[currWallet].fourDel]) {
        totalVote += 1;
    }

    return totalVote >= 3;
    }


    function createNewRegistry(address currWallet, Registery memory delegates) public verifiedByOwner(currWallet) {
        register[currWallet] = delegates;
        emit RegistryCreated(currWallet, delegates.firDel, delegates.secDel, delegates.thirDel, delegates.fourDel);
    }

    function updateOldToNew(address oldWallet, address newWallet) public verifiedByOwner(oldWallet) {
        // solhint-disable-next-line custom-errors
        require(voteValidation(oldWallet), "Min 3/4 votes required");
        walletStatusOldToNew[oldWallet] = newWallet;
        emit WalletMapped(oldWallet, newWallet);
    }

    function deleGateVote(address forWallet, address signer) public verifiedByOwner(forWallet) {
        require(msg.sender == register[forWallet].firDel || msg.sender == register[forWallet].secDel || msg.sender == register[forWallet].thirDel || msg.sender == register[forWallet].fourDel, "Not authorized");
        // solhint-disable-next-line custom-errors
        require(delegateVoteCount[forWallet][signer] == false, "Already voted");
        delegateVoteCount[forWallet][signer] = true;
        emit Voted(forWallet, signer);
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
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BuyMeACoffee {
    // wallet of the system
    // a percentage to be credited once the creator makes a withdrawal
//    address payable escrow;
    address payable companyAccount;
    constructor (address payable _companyAccount) {
//        escrow = _escrow;
        companyAccount = _companyAccount;
    }
    /**
    improvements:-
        - Tips are credited to an escrow account.
            * The creator withdraws from escrow to their account
    */
    // creator information
    struct CreatorAccount {
        bytes32 id;
        string name;
        string about;
        address payable walletAddress;
        string bannerURL;
        uint256 createdAt;
    }

    // TODO: creators to post exclusive content for tippers
    // TODO: enable periodic tips(like subscriptions) and reward tippers with exclusive content
    // TODO: provide multiple tip packages

    // tip information
    struct Tip {
        bytes32 tipId;
        string name;
        string message;
        address from;
        address payable to;
        uint256 amount;
        uint256 createdAt;
    }

    struct CreatorTip {
        CreatorAccount creator;
        Tip tip;
    }

    struct Withdrawal {
        bytes32 id;
        address payable withdrawnBy;
        address withdrawFrom;
        uint256 timestamp;
    }

    // map of creators
    mapping(bytes32 => CreatorAccount) public creatorAccounts;
    // list of all creator ids
    CreatorAccount[] creatorAccountList;
    /*TODO: this doesn't work:
    // map of creators to their tips
    // mapping(bytes32 => Tip[] ) public creatorTips;
    */
    // list of tips
    Tip[] tips;
    /* TODO: evaluate if this is needed!
    - list of creator tips
    */
    CreatorTip[] creatorTips;

    mapping(bytes32 => Withdrawal) public withdrawals;

    // add a new creator account
    function addCreatorAccount(string memory name, string memory about, string memory bannerURL) public returns(CreatorAccount memory) {
        uint256 timestamp = block.timestamp;
        bytes32 creatorId = keccak256(
            abi.encodePacked(
                msg.sender,
                address(this),
                name,
                about,
                bannerURL,
                timestamp
            )
        );

        CreatorAccount memory creatorAccount = CreatorAccount(
            creatorId,
            name,
            about,
            payable(msg.sender),
            bannerURL,
            timestamp
        );

        // add creator account to the creator accounts map
        creatorAccountList.push(creatorAccount);

        // add creator id to the creator id list
        // creatorAccountIds.push(creatorId);

        return creatorAccount;
    }

    // fetch a list of all creators
    function getCreators() public view returns(CreatorAccount[] memory) {
        return creatorAccountList;
    }
    
    // give a tip to a creator
    function giveTip(string memory name, string memory message, address payable to) public payable {
        uint256 timestamp = block.timestamp;
        bytes32 tipId = keccak256(
            abi.encodePacked(
                msg.sender,
                address(this),
                name,
                message,
                to,
                timestamp
            )
        );

        Tip memory tip = Tip(
            tipId,
            name,
            message,
            msg.sender,
            to,
            msg.value,
            timestamp
        );
        tips.push(tip);
    }

    modifier onlyCompany() {
        require(msg.sender == companyAccount);
        _;
    }

    // modifier for operations only performed by creator or system
    modifier onlyCreatorOrCompany(address creatorAddress) {
        require(msg.sender == creatorAddress || msg.sender == companyAccount);
        _;
    }
    
    // modifier for operations only performed by creator
    modifier onlyCreator(address creatorAddress) {
        require(msg.sender == creatorAddress);
        _;
    }

    // lists all tips
    function getAllTips() public view returns(Tip[] memory) {
        return tips;
    }

    // lists a creators tip amount
    function getCreatorTotalTips(address payable creatorAddress) public view onlyCreatorOrCompany(creatorAddress) returns(uint256) {
        uint256 amount = 0;
        for(uint i = 0; i < tips.length; i++) {
            if(tips[i].to == creatorAddress) {
                amount += tips[i].amount;
            }
        }

        return amount;
    }

    // calculates the summary of withdrawal
    // returns (how much the creator will get), (company/convenience fee i.e. 10%)
    function getWithdrawalBreakdown(address payable creatorAddress, uint256 amount) public view onlyCreator(creatorAddress) returns(uint256 payOut, uint256 companyFee) {
        // get the total of tips by creator
        uint256 totalAmount = getCreatorTotalTips(creatorAddress);
        // check if amount to withdraw is <= total
        require(amount <= totalAmount, "cannot withdraw more than your total balance");
        // return the amount to be paid and the company fee i.e. 10% of total
        companyFee = amount * 10/100;
        payOut = amount - companyFee;
        return (payOut, companyFee);
    }

    function withdrawMyTips(address payable creatorAddress, uint256 amount) public payable onlyCreator(creatorAddress) {
        (uint256 payOut, uint256 companyFee) = getWithdrawalBreakdown(creatorAddress, amount);

        // make payment to creator
        (bool success,) = creatorAddress.call{value: payOut}("");
        require(success, "failed to make withdrawal!");

        // deposit service fee to company account
        (success,) = companyAccount.call{value: companyFee}("");
        require(success, "failed to send to company account!");

        uint256 timestamp = block.timestamp;
        bytes32 withdrawalId = keccak256(
            abi.encodePacked(
                creatorAddress,
                address(this),
                timestamp
            )
        );
        withdrawals[withdrawalId] = Withdrawal(
            withdrawalId,
            creatorAddress,
            address(this),
            timestamp
        );
    }

    function getEscrowBalance() public onlyCompany view returns (uint256) {
        return address(this).balance;
    }

    function getCreatorBalance(address payable addr) public onlyCreator(addr) view returns (uint256) {
        return addr.balance;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BuyMeACoffee {
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

    // tip information
    struct Tip {
        string name;
        string message;
        address from;
        address to;
        uint256 amount;
        uint256 createdAt;
    }

    struct CreatorTip {
        CreatorAccount creator;
        Tip tip;
    }

    // wallet of the system
    // a percentage to be credited once the creator makes a withdrawal
    address payable serviceWallet;
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

    // TODO:
    // function giveTip(string memory name, string memory message, address payable to, uint256 amount) public payable returns(Tip memory) {
        
    // }
}

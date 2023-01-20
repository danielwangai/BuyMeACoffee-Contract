const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BuyMeACoffee", async () => {
    let creator1, creator2, subscriber1, subscriber2, companyAccount, escrow;
    let buyMeACoffee;
    beforeEach(async () => {
        // setup accounts
        [creator1, creator2, subscriber1, subscriber2, companyAccount, escrow] = await ethers.getSigners();

        // deploy contract
        const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
        buyMeACoffee = await BuyMeACoffee.deploy(
            escrow.address,
            companyAccount.address
        );

        const name = "John Doe";
        const about = "All about fun";
        const bannerUrl = "http://localhost:3000/image.png";
        const transaction = await buyMeACoffee.connect(creator1).addCreatorAccount(name, about, bannerUrl);
        await transaction.wait()
    })

    describe("Creator Accounts", async () => {
        it("successfully creates a creator account", async () => {
            const creatorListBefore = await buyMeACoffee.getCreators();
            const name = "John Doe 1";
            const about = "The Crypto Channel";
            const bannerUrl = "http://localhost:3000/image1.png";
            const transaction = await buyMeACoffee.connect(creator1).addCreatorAccount(name, about, bannerUrl);
            await transaction.wait()
            const creatorListAfter = await buyMeACoffee.getCreators();
            expect(creatorListAfter.length - creatorListBefore.length).to.be.equal(1);
        })
    })

    describe("Fetch Creators", async () => {
        it("successfully creates a creator account", async () => {
            const creatorList = await buyMeACoffee.getCreators();
            expect(creatorList.length).to.be.equal(1);
            expect(creatorList[0].name).to.be.equal("John Doe");
            expect(creatorList[0].about).to.be.equal("All about fun");
            expect(creatorList[0].bannerURL).to.be.equal("http://localhost:3000/image.png");
            expect(creatorList[0].walletAddress).to.be.equal(creator1.address);
        })
    })
})

const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BuyMeACoffee", async () => {
    let creator1, creator2, subscriber1, subscriber2, companyAccount, escrow;
    let creator1Id;
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

        await buyMeACoffee.deployed();

        const name = "John Doe";
        const about = "All about fun";
        const bannerUrl = "http://localhost:3000/image.png";
        const transaction = await buyMeACoffee.connect(creator1).addCreatorAccount(name, about, bannerUrl);
        await transaction.wait()

        // get creators
        const creators = await buyMeACoffee.getCreators();
        creator1Id = creators[0].id;
    })

    describe("Creator Accounts", async () => {
        it("successfully creates a creator account", async () => {
            const creatorListBefore = await buyMeACoffee.getCreators();
            const name = "John Doe 1";
            const about = "The Crypto Channel";
            const bannerURL = "http://localhost:3000/image1.png";
            const transaction = await buyMeACoffee.connect(creator1).addCreatorAccount(name, about, bannerURL);
            await transaction.wait();
            const creatorListAfter = await buyMeACoffee.getCreators();
            expect(creatorListAfter.length - creatorListBefore.length).to.be.equal(1);
            expect(creatorListAfter[1].name).to.be.equal(name);
            expect(creatorListAfter[1].about).to.be.equal(about);
            expect(creatorListAfter[1].bannerURL).to.be.equal(bannerURL);
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

    describe("Tips", async () => {
        const tip = tokens(5);
        beforeEach(async () => {
            const subscriberName = "Jane Doe";
            const message = "Great content!";
            const transaction = await buyMeACoffee.connect(subscriber1).giveTip(
                subscriberName, message, creator1.address, { value: tip }
            );
            await transaction.wait();
        })

        it("calculates total value of tips for a creator", async () => {
            let totalTips = await buyMeACoffee.connect(creator1).getCreatorTotalTips(creator1.address);
            expect(tip).to.be.equal(totalTips);

            // add one more tip
            const tip2 = tokens(7);
            const expectedTipValue = tokens(12);
            const transaction = await buyMeACoffee.connect(subscriber2).giveTip(
                "Subscriber Two", "Awesome content!", creator1.address, { value: tip2 }
            );
            await transaction.wait();

            totalTips = await buyMeACoffee.connect(creator1).getCreatorTotalTips(creator1.address);
            expect(expectedTipValue).to.be.equal(totalTips);
        })
    })
})

const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BuyMeACoffee", async () => {
    let creator1, creator2, subscriber1, subscriber2, companyAccount;
    let creator1Id;
    let buyMeACoffee;
    beforeEach(async () => {
        // setup accounts
        [creator1, creator2, subscriber1, subscriber2, companyAccount] = await ethers.getSigners();

        // deploy contract
        const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
        buyMeACoffee = await BuyMeACoffee.deploy(companyAccount.address);

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

    describe("Withdrawal", async () => {
        const tip = tokens(5);
        beforeEach(async () => {
            const subscriberName = "Jane Doe";
            const message = "Great content!";
            let transaction = await buyMeACoffee.connect(subscriber1).giveTip(
                subscriberName, message, creator1.address, { value: tip }
            );
            await transaction.wait();

            // tip 2
            const subscriberName2 = "Jane Doe";
            const message2 = "Great content!";
            transaction = await buyMeACoffee.connect(subscriber2).giveTip(
                subscriberName2, message2, creator1.address, { value: tip }
            );
            await transaction.wait();
        })

        it("calculates withdrawal breakdown", async () => {
            const expectedTotalTips = tokens(10);
            let totalTips = await buyMeACoffee.connect(creator1).getCreatorTotalTips(creator1.address);
            expect(expectedTotalTips).to.be.equal(totalTips);
            const [payOut, companyFee] = await buyMeACoffee.connect(creator1).getWithdrawalBreakdown(creator1.address, tokens(10));

            const expectedPayOut = tokens(9);
            const expectedCompanyFee = tokens(1);

            expect(expectedPayOut).to.be.equal(payOut);
            expect(expectedCompanyFee).to.be.equal(companyFee);
        })

        it("withdraws creator tips", async () => {
            // before withdrawal
            const creatorBalanceBefore = await buyMeACoffee.connect(creator1).getCreatorBalance(creator1.address);
            const companyBalanceBefore = await buyMeACoffee.connect(companyAccount).getCreatorBalance(companyAccount.address);
            const escrowBalanceBefore = await buyMeACoffee.connect(companyAccount).getEscrowBalance();

            // withdraw
            await buyMeACoffee.connect(creator1).withdrawMyTips(creator1.address, tokens(10));
            const creatorBalanceAfter = await buyMeACoffee.connect(creator1).getCreatorBalance(creator1.address);
            const companyBalanceAfter = await buyMeACoffee.connect(companyAccount).getCreatorBalance(companyAccount.address);
            const escrowBalanceAfter = await buyMeACoffee.connect(companyAccount).getEscrowBalance();

            expect(companyBalanceAfter).to.be.greaterThan(companyBalanceBefore);
            expect(creatorBalanceAfter).to.be.greaterThan(creatorBalanceBefore);
            expect(escrowBalanceBefore).to.be.greaterThan(escrowBalanceAfter);
            expect(escrowBalanceAfter).to.be.equal(tokens(0));
        })
    })
})

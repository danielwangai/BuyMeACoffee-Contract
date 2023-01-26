const hre = require("hardhat");

async function printCreators(creators) {
	for (const creator of creators) {
		console.log("====")
		const name = creator.name;
		const about = creator.about;
		const wallet = creator.walletAddress;
		const timestamp = creator.createdAt;
		console.log(`Name: ${name}, about: ${about}, timestamp: ${timestamp}, walletAddress: ${wallet}`);
	}
}

async function printCreatorTips(tips) {
	for (const tip of tips) {
		console.log("====")
		const name = tip.name;
		const message = tip.message;
		const from = tip.from;
		const to = tip.to;
		const amount = tip.amount;
		// const timestamp = creator.createdAt;
		console.log(`Name: ${name}, message: ${message}, to: ${to}, from: ${from}, amount: ${amount}`);
	}
}

async function main() {
	const [creator1, subscriber1, subscriber2, escrow, companyAddress] = await hre.ethers.getSigners();
	const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
	const buyMeACoffee = await BuyMeACoffee.deploy(escrow.address, companyAddress.address);


	// Deploy the contract.
	await buyMeACoffee.deployed();
	console.log("BuyMeACoffee deployed to:", buyMeACoffee.address);

	const addresses = []
	// create CreatorAccount
	await buyMeACoffee.connect(creator1).addCreatorAccount(
		"Web3 Creations",
		"Awesome web3 stuff",
		"https://unsplash.com/photos/L2QB-rG5NM0"
	);

	console.log("==List Creators==")
	const creators = await buyMeACoffee.getCreators();
	printCreators(creators);

	// give tip to creator
	const tip = {value: hre.ethers.utils.parseEther("1")};
	await buyMeACoffee.connect(subscriber1).giveTip("John Doe", "Awesome content!", creator1.address, tip);
	await buyMeACoffee.connect(subscriber2).giveTip("Jane Doe", "Really Awesome content!", creator1.address, tip);

	const tips = await buyMeACoffee.getAllTips();
	printCreatorTips(tips);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

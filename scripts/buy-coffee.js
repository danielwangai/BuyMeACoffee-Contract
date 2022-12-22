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

async function main() {
	const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
	const buyMeACoffee = await BuyMeACoffee.deploy();

	const [creator1,] = await hre.ethers.getSigners();

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
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

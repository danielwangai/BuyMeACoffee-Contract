const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const companyAccount = process.env.COMPANY_ACCOUNT;
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy(companyAccount);

  console.log("BuyMeACoffee contract address: ", buyMeACoffee.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });

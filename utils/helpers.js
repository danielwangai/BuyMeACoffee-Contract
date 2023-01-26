const getAllTips = async (contract) => {
    // return await contract.getAllTips();
    console.log("contract")
    console.log(await contract.getAllTips())
}

const getCreatorTips = async (tips, creatorId) => {
    let myTips = [];
    for (const tip of tips) {
        if (tip.tipId === creatorId) {
            myTips.push({
                tipId: tip.tipId,
                name: tip.name,
                message: tip.message,
                from: tip.from,
                to: tip.to,
                amount: tip.amount,
                createdAt: tip.createdAt,
            })
            console.log(`Name: ${name}, message: ${message}, to: ${to}, from: ${from}, amount: ${amount}`);
        }
    }

    return myTips;
}

module.exports = {getAllTips, getCreatorTips};

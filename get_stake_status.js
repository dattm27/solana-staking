const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");
const fs = require("fs");
const getStakeStatus = async (connection, stakePubkey) => {
    const accountInfo = await connection.getParsedAccountInfo(stakePubkey);
    if (!accountInfo.value) {
        throw new Error("Stake account not found");
    }

    const parsed = accountInfo.value.data.parsed;
    // console.log(accountInfo.value);
    const type = parsed.type;

    if (type === "uninitialized") {
        return { state: "uninitialized" };
    }

    if (type === "initialized") {
        return { state: "initialized" }; 
    }

    if (type === "stake") {
        const delegation = parsed.info.stake?.delegation;
        if (!delegation) {
            return { state: "inactive" };
        }

        const currentEpoch = (await connection.getEpochInfo()).epoch;
        const activationEpoch = parseInt(delegation.activationEpoch, 10);
        const deactivationEpoch = parseInt(delegation.deactivationEpoch, 10);

        if (activationEpoch > currentEpoch) {
            return { state: "activating" };
        }

        if (deactivationEpoch === 18446744073709551615) {
            return { state: "active" };
        }

        if (deactivationEpoch > currentEpoch) {
            return { state: "deactivating" };
        }

        return { state: "inactive" };
    }

    return { state: type };
};



module.exports = { getStakeStatus };

// const main = async () => {
//     const connection = new Connection(clusterApiUrl('devnet'), 'processed');
//     const secret = JSON.parse(fs.readFileSync("id.json"));
//     const wallet = Keypair.fromSecretKey(Uint8Array.from(secret));
//     console.log(await getStakeStatus(connection, new PublicKey("i91FV7z2Yfxo7V611HaDeGpunWU3BrpVHbiFKfFR2CH")))
// }

// main();
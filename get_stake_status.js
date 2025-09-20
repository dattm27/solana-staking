const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

const getStakeStatus = async (connection, stakePubkey) => {
    const accountInfo = await connection.getParsedAccountInfo(stakePubkey);
    if (!accountInfo.value) {
        throw new Error("Stake account not found");
    }
    console.log(accountInfo.value);
    const parsed = accountInfo.value.data.parsed;
    const type = parsed.type;

    if (type === "uninitialized") {
        return { state: "uninitialized" };
    }

    if (type === "initialized") {
        return { state: "initialized" }; // stake account tồn tại, chưa delegate
    }

    if (type === "stake") {
        const delegation = parsed.info.stake?.delegation;
        if (!delegation) return { state: "inactive" };

        const currentEpoch = (await connection.getEpochInfo()).epoch;
        const activationEpoch = parseInt(delegation.activationEpoch, 10);
        const deactivationEpoch = parseInt(delegation.deactivationEpoch, 10);

        if (activationEpoch > currentEpoch) {
            return { state: "activating" };
        } else if (
            deactivationEpoch < currentEpoch &&
            deactivationEpoch !== 18446744073709551615
        ) {
            return { state: "inactive" };
        } else if (
            activationEpoch <= currentEpoch &&
            (deactivationEpoch === 18446744073709551615 ||
                deactivationEpoch > currentEpoch)
        ) {
            return { state: "active" };
        } else {
            return { state: "deactivating" };
        }
    }

    return { state: type };
}

const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const secret = JSON.parse(fs.readFileSync("id.json"));
    const wallet = Keypair.fromSecretKey(Uint8Array.from(secret));
    console.log(await getStakeStatus(connection, new PublicKey("i91FV7z2Yfxo7V611HaDeGpunWU3BrpVHbiFKfFR2CH")))
}

main();
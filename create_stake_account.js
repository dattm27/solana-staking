const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction } = require("@solana/web3.js");

const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const wallet = Keypair.generate();
    const airdogSignature = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdogSignature);
    //    const balance = await connection.getBalance(wallet.publicKey);
    //    console.log(balance);

    const stakeAccount = Keypair.generate();
    const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram);
    const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
    const amountToStake = minimumRent + amountUserWantsToStake;
    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: amountToStake,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey

    })
    const createStakeAccountTxId = await sendAndConfirmTransaction(connection, createStakeAccountTx, wallet , stakeAccount);
    console.log(`Stake account created. Tx Id:  ${createStakeAccountTxId}`);

    let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log(`Stake account balance: ${stakeBalance/ LAMPORTS_PER_SOL}`);

    let stakeStatus = await connection.getStakeActivation(
        stakeAccount.publicKey
    );

    console.log(`Stake account status ${stakeStatus.state}`);
}

const runMain = async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
    }
}

runMain();
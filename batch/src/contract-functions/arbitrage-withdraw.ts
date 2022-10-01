import 'dotenv/config';
import createWeb3 from '../web3-factory';
import {withdrawABI} from '../abis/Arbitrage';

const {
    ARBITRAGE_CONTRACT_ADDRESS,
    WITHDRAW_TOKEN_ADDRESS,
    WITHDRAW_BENEFICIARY_ADDRESS,
    WITHDRAW_BENEFICIARY_PRIVATE_KEY
} = process.env;

const withdraw = async () => {
    const web3 = createWeb3('json-rpc');
    const arbitrageContract = new web3.eth.Contract(withdrawABI as any, ARBITRAGE_CONTRACT_ADDRESS);

    const gas = await arbitrageContract.methods.withdraw(WITHDRAW_TOKEN_ADDRESS).estimateGas({ from: WITHDRAW_BENEFICIARY_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(WITHDRAW_BENEFICIARY_ADDRESS, 'latest');
    const data = arbitrageContract.methods.withdraw(WITHDRAW_TOKEN_ADDRESS).encodeABI();
    const transaction = {
        from: WITHDRAW_BENEFICIARY_ADDRESS,
        to: ARBITRAGE_CONTRACT_ADDRESS,
        gas,
        gasPrice,
        nonce,
        data,
        value: 0
    }
    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, WITHDRAW_BENEFICIARY_PRIVATE_KEY);

    try {
        await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('Withdraw successful.');
    } catch (e) {
        console.error('Withdraw failed.', e);
    }
}

export default withdraw;

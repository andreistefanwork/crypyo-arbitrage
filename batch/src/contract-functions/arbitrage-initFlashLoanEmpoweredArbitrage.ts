import 'dotenv/config';
import createWeb3 from '../web3-factory.js';
import {initFlashLoanEmpoweredArbitrageABI} from '../abis/Arbitrage.js';

const {
    PRIMARY_TOKEN_ADDRESS,
    PRIMARY_TOKEN_INPUT_AMOUNT,
    ARBITRAGE_CONTRACT_ADDRESS,
    ARBITRAGE_MANAGER_ADDRESS,
    ARBITRAGE_MANAGER_PRIVATE_KEY,
    TEST
} = process.env;

const initFlashLoanEmpoweredArbitrage = async (encodedSwaps: string) => {
    const web3 = TEST ? createWeb3('ganache') : createWeb3('json-rpc');
    const arbitrageContract = new web3.eth.Contract(initFlashLoanEmpoweredArbitrageABI as any, ARBITRAGE_CONTRACT_ADDRESS);

    const gas = await arbitrageContract.methods.initFlashLoanEmpoweredArbitrage(
        PRIMARY_TOKEN_ADDRESS, PRIMARY_TOKEN_INPUT_AMOUNT, encodedSwaps).estimateGas({ from: ARBITRAGE_MANAGER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(ARBITRAGE_MANAGER_ADDRESS, 'latest');
    const data = arbitrageContract.methods.initFlashLoanEmpoweredArbitrage(PRIMARY_TOKEN_ADDRESS, PRIMARY_TOKEN_INPUT_AMOUNT, encodedSwaps).encodeABI();
    const transaction = {
        from: ARBITRAGE_MANAGER_ADDRESS,
        to: ARBITRAGE_CONTRACT_ADDRESS,
        gas,
        gasPrice,
        nonce,
        data,
        value: 0
    }

    const { rawTransaction } = await web3.eth.accounts.signTransaction(transaction, TEST ? ARBITRAGE_MANAGER_ADDRESS : ARBITRAGE_MANAGER_PRIVATE_KEY);

    await web3.eth.sendSignedTransaction(rawTransaction);
}

export default initFlashLoanEmpoweredArbitrage;

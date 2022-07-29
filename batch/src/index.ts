import findArbitrageOpportunity from './arbitrage.js';
import createWeb3 from './web3-factory.js';
import initFlashLoanEmpoweredArbitrage from './contract-functions/arbitrage-initFlashLoanEmpoweredArbitrage.js';
import {encodeSwaps, encodeToBytes} from './abi-encoder.js';

const loop = async () => {
    const web3Ws = createWeb3('ws');
    const subscription = web3Ws.eth.subscribe('newBlockHeaders', async (wsError) => {
        if (wsError) {
            console.error(wsError);
            return;
        }

        try {
            const swaps = await findArbitrageOpportunity();
            if (swaps) {
                const encodedSwaps = encodeSwaps(swaps);
                const encodedToBytes = encodeToBytes(encodedSwaps);
                await initFlashLoanEmpoweredArbitrage(encodedToBytes);

                console.log('Arbitrage opportunity found and executed successfully.');
            }
        } catch (e) {
            console.error(e);
        }
    });

    // close subscription when app is closed
    process.on('SIGINT', () => {
        subscription.unsubscribe();
        process.exit();
    });
}

await loop();

import Swap from './models/swap.js';
import createWeb3 from './web3-factory.js';

export const encodeSwaps = (swaps: Swap[]) => {
    const web3 = createWeb3('json-rpc');

    return web3.eth.abi.encodeParameter('tuple(address,uint,address,bytes)[]',
        [
            [
                swaps[0].token,
                swaps[0].amount,
                swaps[0].aggregationRouter,
                swaps[0].swapData,
            ],
            [
                swaps[1].token,
                swaps[1].amount,
                swaps[1].aggregationRouter,
                swaps[1].swapData,
            ]
        ]);
}

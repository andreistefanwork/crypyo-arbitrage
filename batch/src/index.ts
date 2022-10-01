import findArbitrageOpportunity from './arbitrage';
import createWeb3 from './web3-factory';
import initFlashLoanEmpoweredArbitrage from './contract-functions/arbitrage-initFlashLoanEmpoweredArbitrage';
import {encodeSwaps} from './abi-encoder';
import {exhaustMap, Subject} from 'rxjs';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {ArbitrageResult} from './models/arbitrage-result';

async function loop() {
    const web3Ws = createWeb3('ws');
    const arbitrageSubject = new Subject<void>();
    arbitrageSubject.asObservable()
        .pipe(exhaustMap(() => fromPromise(processArbitrage())))
        .subscribe(logArbitrageResult);

    const newBlockSubscription = web3Ws.eth.subscribe('newBlockHeaders', async (wsError) => {
        if (wsError) {
            console.error(wsError);
            return;
        }

        arbitrageSubject.next();
    });

    process.on('SIGINT', () => {
        newBlockSubscription.unsubscribe();
        arbitrageSubject.complete();
        process.exit();
    });
}

async function processArbitrage(): Promise<ArbitrageResult> {
    try {
        const swaps = await findArbitrageOpportunity();
        if (!swaps) {
            return ArbitrageResult.NOT_PROFITABLE;
        }

        await initFlashLoanEmpoweredArbitrage(encodeSwaps(swaps));
        return ArbitrageResult.SUCCESS;
    } catch (e) {
        console.error(e);
        return ArbitrageResult.FAILURE;
    }
}

function logArbitrageResult(result: ArbitrageResult) {
    switch (result) {
        case ArbitrageResult.SUCCESS:
            console.log('Arbitrage opportunity found and executed successfully.');
            break;
        case ArbitrageResult.NOT_PROFITABLE:
            console.log('Arbitrage opportunity not profitable.');
            break;
        case ArbitrageResult.FAILURE:
            console.log('Arbitrage opportunity failed.');
            break;
        default:
            console.error('Unknown arbitrage result.');
    }
}

(async function () {
    await loop()
})();

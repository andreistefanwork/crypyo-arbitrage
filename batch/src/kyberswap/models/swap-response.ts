export default interface SwapResponse {
    outputAmount: string;
    receivedUsd: string;
    routerAddress: string;
    encodedSwapData: string;
    gasPriceGwei: string;
    totalGas: number;
}

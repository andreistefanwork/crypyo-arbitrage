export default interface SwapRequest extends Record<string, string>{
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    saveGas: string;
    slippageTolerance: string;
    to: string;
    deadline: string;
}

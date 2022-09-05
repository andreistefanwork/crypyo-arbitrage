import 'dotenv/config';
import Web3 from 'web3';
import SwapRequest from './kyberswap/models/swap-request.js';
import {getSwapDetails} from './kyberswap/kyberswap-client.js';
import Swap from './models/swap.js';

const {
    PRIMARY_TOKEN_INPUT_AMOUNT,
    PRIMARY_TOKEN_ADDRESS,
    SECONDARY_TOKEN_ADDRESS,
    SAVE_GAS,
    SLIPPAGE_TOLERANCE,
    ARBITRAGE_CONTRACT_ADDRESS,
    TEST
} = process.env;

const findArbitrageOpportunity: () => Promise<Swap[]> = async () => {
    const {
        outputAmount: estimatedSecondaryTokenAmount,
        routerAddress: firstSwapRouterAddress,
        encodedSwapData: firstSwapEncoded,
        gasPriceGwei: firstSwapGasPriceGwei,
        totalGas: firstSwapTotalGas
    } = await getFirstSwapDetails();

    const minSecondaryTokenAmount = await computeMinTokenAmount(estimatedSecondaryTokenAmount, SLIPPAGE_TOLERANCE).toString();
    const {
        outputAmount: primaryTokenOutput,
        gasPriceGwei: secondSwapGasPriceGwei,
        routerAddress: secondSwapRouterAddress,
        encodedSwapData: secondSwapEncoded,
        totalGas: secondSwapTotalGas
    } = await getSecondSwapDetails(minSecondaryTokenAmount);

    const netOutcome = computeNetOutcome(primaryTokenOutput, PRIMARY_TOKEN_INPUT_AMOUNT, firstSwapGasPriceGwei,
        firstSwapTotalGas, secondSwapGasPriceGwei, secondSwapTotalGas);
    if (TEST ? false : netOutcome.isNeg()) {
        console.log(`Net loss: ${netOutcome} wei at ${(getFormattedCurrentTime())}`);
        return;
    }

    console.log(`Net profit: ${netOutcome} wei at ${(getFormattedCurrentTime())}`);
    return [
        {
            token: PRIMARY_TOKEN_ADDRESS,
            amount: PRIMARY_TOKEN_INPUT_AMOUNT,
            aggregationRouter: firstSwapRouterAddress,
            swapData: firstSwapEncoded
        },
        {
            token: SECONDARY_TOKEN_ADDRESS,
            amount: minSecondaryTokenAmount,
            aggregationRouter: secondSwapRouterAddress,
            swapData: secondSwapEncoded
        }
    ];
}

async function getFirstSwapDetails() {
    const firstSwapRequest: SwapRequest = {
        tokenIn: PRIMARY_TOKEN_ADDRESS,
        tokenOut: SECONDARY_TOKEN_ADDRESS,
        amountIn: PRIMARY_TOKEN_INPUT_AMOUNT,
        saveGas: SAVE_GAS,
        slippageTolerance: SLIPPAGE_TOLERANCE,
        to: ARBITRAGE_CONTRACT_ADDRESS,
        deadline: computeSwapDeadline()
    }

    const swapDetails = await getSwapDetails(firstSwapRequest);
    if (!swapDetails) {
        throw new Error('First swap failed.');
    }

    return swapDetails;
}

async function getSecondSwapDetails(minSecondaryTokenAmount: string) {
    const secondSwapRequest: SwapRequest = {
        tokenIn: SECONDARY_TOKEN_ADDRESS,
        tokenOut: PRIMARY_TOKEN_ADDRESS,
        amountIn: minSecondaryTokenAmount,
        saveGas: SAVE_GAS,
        slippageTolerance: SLIPPAGE_TOLERANCE,
        to: ARBITRAGE_CONTRACT_ADDRESS,
        deadline: computeSwapDeadline()
    }

    const swapDetails = await getSwapDetails(secondSwapRequest);
    if (!swapDetails) {
        throw new Error('Second swap failed.');
    }

    return swapDetails;
}

function computeMinTokenAmount(tokenAmount: string, slippageBips: string) {
    const slippagePoints = Number(slippageBips) / 10000;
    const slippageMultiplier = 1 - slippagePoints;

    return Web3.utils.toBN(tokenAmount).muln(slippageMultiplier);
}

function getFormattedCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

function computeSwapDeadline() {
    const currentTime = new Date().getTime() / 1000;
    const twentyMinutes = 20 * 60;
    const deadline = Math.ceil(currentTime + twentyMinutes);

    return deadline.toString();
}

function computeNetOutcome(tokenOutputAmount: string, tokenInputAmount: string, firstSwapGasPriceGwei: string,
                          firstSwapTotalGas: number, secondSwapGasPriceGwei: string, secondSwapTotalGas: number) {
    const tokenOutputBn = Web3.utils.toBN(tokenOutputAmount);
    const tokenInputBn = Web3.utils.toBN(tokenInputAmount);
    const firstSwapGasFee = Web3.utils.toBN(Web3.utils.toWei(firstSwapGasPriceGwei, 'gwei')).muln(firstSwapTotalGas);
    const secondSwapGasFee = Web3.utils.toBN(Web3.utils.toWei(secondSwapGasPriceGwei, 'gwei')).muln(secondSwapTotalGas);

    return tokenOutputBn.sub(tokenInputBn).sub(firstSwapGasFee).sub(secondSwapGasFee);
}

export default findArbitrageOpportunity;

import fetch from 'node-fetch-commonjs';
import SwapResponse from './models/swap-response';
import SwapRequest from './models/swap-request';

export const getSwapDetails = async (swapRequest: SwapRequest) => {
    const {KYBERSWAP_AGGREGATOR_URL} = process.env;
    const url = `${KYBERSWAP_AGGREGATOR_URL}?${new URLSearchParams(swapRequest).toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Version': 'Latest'
            }
        });

        if (!response || !response.ok) {
            console.error(`Error fetching ${url}`);
            return;
        }

        return await response.json() as Promise<SwapResponse>;
    } catch (e) {
        console.error(e);
    }
};

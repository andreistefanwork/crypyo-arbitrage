import 'dotenv/config';
import Web3 from 'web3';
import * as process from 'process';

const createWeb3Ws = () => {
    const { INFURA_HOST_WS, INFURA_API_KEY } = process.env;
    const INFURA_URL = `${INFURA_HOST_WS}${INFURA_API_KEY}`;

    return new Web3(new Web3.providers.WebsocketProvider(INFURA_URL));
}

const createWeb3JsonRpc = () => {
    const { INFURA_HOST_JSON_RPC, INFURA_API_KEY } = process.env;
    const INFURA_URL = `${INFURA_HOST_JSON_RPC}${INFURA_API_KEY}`;

    return new Web3(new Web3.providers.HttpProvider(INFURA_URL));
}

const createWeb3Ganache = () => {
    return new Web3(new Web3.providers.HttpProvider(process.env.GANACHE_URL));
}

const createWeb3 = (protocol: 'ws'|'json-rpc'|'ganache') => {
    switch (protocol) {
        case 'ws':
            return createWeb3Ws();
        case 'json-rpc':
            return createWeb3JsonRpc();
        case 'ganache':
            return createWeb3Ganache();
        default:
            throw new Error(`Unknown protocol: ${protocol}`);
    }
}

export default createWeb3;

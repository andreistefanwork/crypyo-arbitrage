import createWeb3 from '../web3-factory';
import {balanceOfABI} from '../abis/ERC20';

const balanceOf = async (tokenAddress: string, accountAddress: string) => {
    const web3 = createWeb3('json-rpc');
    const erc20Token = new web3.eth.Contract(balanceOfABI as any, tokenAddress);

    return await erc20Token.methods.balanceOf(accountAddress).call();
}

export default balanceOf;

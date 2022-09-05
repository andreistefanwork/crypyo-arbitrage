// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TransferHelper.sol";
import "./dydx/ICallee.sol";
import "./dydx/DydxFlashloanBase.sol";

contract Arbitrage is ICallee, DydxFlashloanBase, Ownable {
    struct Swap {
        address aggregationRouter;
        bytes swapData;
    }

    address private immutable dydxSoloMargin;

    event SwapPerformed(uint index);
    event SuccessfulArbitrage();
    event WithdrawFunds(uint amount);

    constructor(address _dydxSoloMargin) {
        dydxSoloMargin = _dydxSoloMargin;
    }


    function initFlashLoanEmpoweredArbitrage(address flashLoanToken, uint flashLoanAmount, bytes memory data) external onlyOwner {
        ISoloMargin solo = ISoloMargin(dydxSoloMargin);

        uint repayAmount = _getRepaymentAmountInternal(flashLoanAmount);
        uint marketId = _getMarketIdFromTokenAddress(dydxSoloMargin, flashLoanToken);

        IERC20(flashLoanToken).approve(dydxSoloMargin, repayAmount);

        Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);
        operations[0] = _getWithdrawAction(marketId, flashLoanAmount);
        operations[1] = _getCallAction(data);
        operations[2] = _getDepositAction(marketId, repayAmount);

        Account.Info[] memory accountInfos = new Account.Info[](1);
        accountInfos[0] = _getAccountInfo();

        solo.operate(accountInfos, operations);

        emit SuccessfulArbitrage();
    }

    function withdraw(IERC20 token) external onlyOwner {
        uint amount = token.balanceOf(address(this));
        TransferHelper.safeTransfer(
            address(token),
            msg.sender,
            amount
        );

        emit WithdrawFunds(amount);
    }

    /**
     * The function is called by DyDx Solo Margin contract after the loan is granted.
     *
     * The function implementation performs the arbitrage and must make sufficient profit to
     * cover the loan repayment and hopefully still remain with some funds in the contract.
     *
     * After the function executes, the loan must be repaid, otherwise the transaction will be reverted.
     */
    function callFunction(address sender, Account.Info memory account, bytes memory data) public override {
        require(msg.sender == dydxSoloMargin, "The flash loan empowered code is not called by DydxSoloMargin.");
        require(sender == address(this), "The flash loan is not initiated by this contract.");

        Swap[] memory swaps = abi.decode(data, (Swap[]));
        Swap memory firstSwap = swaps[0];
        Swap memory secondSwap = swaps[1];

        _doSwap(firstSwap.aggregationRouter, firstSwap.swapData, 0);
        _doSwap(secondSwap.aggregationRouter, secondSwap.swapData, 1);
    }

    /**
     * The actual swap is handled by KyberSwap's AggregationRouter contract.
     *
     * All the required information about the swap like tokens, amount in, min amount out, routes
     * are contained in the swap.swapData field.
     */
    function _doSwap(address aggregationRouter, bytes memory swapData, uint swapIndex) internal {
        (bool success,) = aggregationRouter.call(swapData);
        require(success, "Swap failed");

        emit SwapPerformed(swapIndex);
    }
}

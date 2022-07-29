// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import {Account} from "./ISoloMargin.sol";

interface ICallee {
    function callFunction(address sender, Account.Info calldata accountInfo, bytes calldata data) external;
}

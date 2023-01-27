// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract ZoneToken is ERC20, Ownable {
    constructor() ERC20("ZONE", "ZONE") {
        _mint(msg.sender, 10000000000 * 10 ** decimals());
    }
}

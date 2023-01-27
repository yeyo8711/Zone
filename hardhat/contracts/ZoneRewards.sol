// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZoneRewards is ReentrancyGuard, Ownable {
    IERC20 public ZoneToken;

    uint256 ticketCost = 1000 * 10 ** 18;
    address public constant deadAddress =
        0x000000000000000000000000000000000000dEaD;
    address public server;

    mapping(address => uint256) public availableTickets;
    mapping(address => uint256) public availableRewards;

    constructor(address _gameToken) {
        ZoneToken = IERC20(_gameToken);
        server = msg.sender;
    }

    // Takes Game tokens from user and gives a ticket to play
    function buyTicket() external {
        require(availableTickets[msg.sender] == 0);
        require(ZoneToken.transferFrom(msg.sender, address(this), ticketCost));
        availableTickets[msg.sender] = 1;
    }

    // At the end of the game this function is called
    // With the addresses of every player in that game
    // And their tickets are "removed"
    function endGame(address[] memory _players) external onlyServer {
        for (uint256 i; i < _players.length; i++) {
            require(
                availableTickets[_players[i]] == 1,
                "One of the players does not have a ticket"
            );
            availableTickets[_players[i]] = 0;
        }
    }

    // Every Hour this function is called from the backend
    // Along with the players and their reward count
    function updateRewards(
        address[] memory _players,
        uint256[] memory _rewards
    ) external onlyServer {
        uint256 playersLength = _players.length;
        require(playersLength == _rewards.length, "Arrays length dont match");
        for (uint256 i; i < playersLength; i++) {
            availableRewards[_players[i]] += _rewards[i] * 10 ** 18;
        }
    }

    // Once rewards have been updated,
    // Players can Claim their rewards
    function claimRewards() external {
        uint256 amount = availableRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        availableRewards[msg.sender] = 0;
        ZoneToken.transfer(msg.sender, amount);
    }

    // Getters & Setters

    modifier onlyServer() {
        require(msg.sender == server);
        _;
    }

    function updateServerAddress(address _newServer) external onlyOwner {
        server = _newServer;
    }

    function changeTicketCost(uint256 _newAmount) external onlyOwner {
        ticketCost = _newAmount * 10 ** 18;
    }
}

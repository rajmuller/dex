//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable {
    using SafeMath for uint256;

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    mapping(bytes32 => Token) public tokenMapping;
    bytes32[] tokenList;

    mapping(address => mapping(bytes32 => uint256)) public balances;

    modifier onlyExistingToken(bytes32 _ticker) {
        require(tokenMapping[_ticker].tokenAddress != address(0), "Token is not initialized");
        _;
    }

    function getTokenList() public view returns (bytes32[] memory) {
        return tokenList;
    }

    function addToken(bytes32 _ticker, address _tokenAddress) external onlyOwner {
        tokenMapping[_ticker] = Token(_ticker, _tokenAddress);
        tokenList.push(_ticker);
    }

    function deposit(uint256 _amount, bytes32 _ticker) external onlyExistingToken(_ticker) {
        IERC20(tokenMapping[_ticker].tokenAddress).transferFrom(msg.sender, address(this), _amount);
        balances[msg.sender][_ticker] = balances[msg.sender][_ticker].add(_amount);
    }

    function withdraw(uint256 _amount, bytes32 _ticker) external onlyExistingToken(_ticker) {
        require(balances[msg.sender][_ticker] >= _amount, "Balance not sufficient");

        balances[msg.sender][_ticker] = balances[msg.sender][_ticker].sub(_amount);
        IERC20(tokenMapping[_ticker].tokenAddress).transfer(msg.sender, _amount);
    }

    function depositEth() external payable {
        balances[msg.sender][bytes32("ETH")] += msg.value;
    }

    function withdrawEth(uint256 _amount) external {
        require(balances[msg.sender][bytes32("ETH")] >= _amount, "Not enough balance");
        balances[msg.sender][bytes32("ETH")] -= _amount;
    }
}

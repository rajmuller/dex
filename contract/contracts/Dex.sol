//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "hardhat/console.sol";

import "./Wallet.sol";

contract Dex is Wallet {
    enum Side {
        BUY,
        SELL
    }

    uint256 public nextOrderId = 0;

    struct Order {
        uint256 id;
        address trader;
        Side side;
        bytes32 ticker;
        uint256 price;
        uint256 amount;
        uint256 filled;
    }

    mapping(bytes32 => mapping(uint8 => Order[])) public orderbook;

    // TODO: implement a more effective sorting algorithm AND use memory to calculate new array order
    function _sort(Order[] storage _orders, bool _reverse) internal {
        if (!_reverse) {
            for (uint256 index = _orders.length - 1; index > 0; index--) {
                if (_orders[index].price > _orders[index - 1].price) {
                    Order memory orderToRearrange = _orders[index - 1];
                    _orders[index - 1] = _orders[index];
                    _orders[index] = orderToRearrange;
                }
            }
        } else {
            for (uint256 index = _orders.length - 1; index > 0; index--) {
                if (_orders[index].price < _orders[index - 1].price) {
                    Order memory orderToRearrange = _orders[index];
                    _orders[index] = _orders[index - 1];
                    _orders[index - 1] = orderToRearrange;
                }
            }
        }
    }

    function getOrderBook(bytes32 _ticker, Side _side) public view returns (Order[] memory) {
        return orderbook[_ticker][uint8(_side)];
    }

    function createLimitOrder(
        Side _side,
        bytes32 _ticker,
        uint256 _amount,
        uint256 _price
    ) public {
        if (_side == Side.BUY) {
            // 1M >= 1M *
            require(balances[msg.sender]["ETH"] >= (_amount * _price) / 1 ether, "Insufficient balance");
        } else if (_side == Side.SELL) {
            require(balances[msg.sender][_ticker] >= _amount, "Insufficient tokens");
        }

        Order[] storage orders = orderbook[_ticker][uint8(_side)];

        orders.push(Order(nextOrderId, msg.sender, _side, _ticker, _price, _amount, 0));

        if (_side == Side.BUY) {
            _sort(orders, false);
        } else {
            _sort(orders, true);
        }

        nextOrderId++;
    }

    function createMarketOrder(
        Side _side,
        bytes32 _ticker,
        uint256 _amount
    ) public {
        if (_side == Side.SELL) {
            require(balances[msg.sender][_ticker] >= _amount, "Insufficient tokens");
        }

        uint8 oppositeSide = uint8(_side) == 0 ? 1 : 0;
        Order[] storage orders = orderbook[_ticker][oppositeSide];

        uint256 totalFilled;

        for (uint256 index = 0; index < orders.length && totalFilled < _amount; index++) {
            uint256 leftToFill = _amount - totalFilled;
            uint256 availableToFill = orders[index].amount - orders[index].filled;
            uint256 filled = 0;

            if (availableToFill >= leftToFill) {
                filled = leftToFill;
            } else {
                filled = availableToFill;
            }

            totalFilled += filled;
            orders[index].filled += filled;
            uint256 cost = (filled * orders[index].price) / 1 ether;
            // console.log("price:", orders[index].price);
            // console.log("cost:", cost);
            // console.log("filled:", filled);

            if (_side == Side.BUY) {
                //msg.sender is the buyer
                require(balances[msg.sender]["ETH"] >= cost, "Insufficient balance");

                balances[msg.sender][_ticker] += filled;
                balances[msg.sender]["ETH"] -= cost;

                balances[orders[index].trader][_ticker] -= filled;
                balances[orders[index].trader]["ETH"] += cost;
            } else {
                //msg.sender is the seller
                balances[msg.sender][_ticker] -= filled;
                balances[msg.sender]["ETH"] += cost;

                balances[orders[index].trader][_ticker] += filled;
                balances[orders[index].trader]["ETH"] -= cost;
            }
        }

        while (orders.length > 0 && orders[0].amount == orders[0].filled) {
            for (uint256 index = 0; index < orders.length - 1; index++) {
                orders[index] = orders[index + 1];
            }
            orders.pop();
        }
    }
}

pragma solidity ^0.4.13;

import './ERC20.sol';

contract PhaseICO is ERC20 {
    uint256 public icoSince;
    uint256 public icoTill;

    uint256 public collectedEthers;

    Phase[] public phases;

    struct Phase {
    uint256 price;
    uint256 maxAmount;
    }

    function PhaseICO(
    uint256 _icoSince,
    uint256 _icoTill,
    uint256 initialSupply,
    string tokenName,
    string tokenSymbol,
    uint8 precision,
    bool transferAllSupplyToOwner,
    bool _locked
    ) ERC20(initialSupply, tokenName, precision, tokenSymbol, transferAllSupplyToOwner, _locked) {
        standard = 'PhaseICO 0.1';

        icoSince = _icoSince;
        icoTill = _icoTill;
    }

    function getIcoTokensAmount(uint256 _collectedEthers, uint256 _value) returns (uint256) {
        uint256 amount;

        uint256 newCollectedEthers = _collectedEthers;
        uint256 remainingValue = _value;

        for (uint i = 0; i < phases.length; i++) {
            Phase storage phase = phases[i];

            if(phase.maxAmount > newCollectedEthers) {
                if (newCollectedEthers + remainingValue > phase.maxAmount) {
                    uint256 diff = phase.maxAmount - newCollectedEthers;

                    amount += diff * (uint256(10) ** decimals) / phase.price;

                    remainingValue -= diff;
                    newCollectedEthers += diff;
                }
                else {
                    amount += remainingValue * (uint256(10) ** decimals) / phase.price;

                    newCollectedEthers += remainingValue;

                    remainingValue = 0;
                }
            }

            if (remainingValue == 0) {
                break;
            }
        }

        if (remainingValue > 0) {
            return 0;
        }

        return amount;
    }

    function buy(address _address, uint256 time, uint256 value) internal returns (bool) {
        if (locked == true) {
            return false;
        }

        if (time < icoSince) {
            return false;
        }

        if (time > icoTill) {
            return false;
        }

        if (value == 0) {
            return false;
        }

        uint256 amount = getIcoTokensAmount(collectedEthers, value);

        if(amount == 0) {
            return false;
        }

        if (balanceOf(this) < amount) {
            return false;
        }

        if (balanceOf(_address) + amount < balanceOf(_address)) {
            return false;
        }

        setBalance(_address, balanceOf(_address) + amount);
        setBalance(this, balanceOf(this) - amount);

        collectedEthers += value;

        Transfer(this, _address, amount);

        return true;
    }

    function () payable {
        bool status = buy(msg.sender, now, msg.value);

        require(status == true);
    }
}
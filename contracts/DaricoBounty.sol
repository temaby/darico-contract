pragma solidity ^0.4.13;

import "../libs/contracts/Bounty.sol";
import "../libs/contracts/Ownable.sol"
import "Darico.sol";

contract DaricoBounty is ERC20, Ownable {

    uint8 constant DRCDAB = 2; // assumed the same decimals as DRC
    uint8 constant DECIMALS = 18;

    address drc;

    function DaricoBounty (_drc) { // @TODO add parameters
        drc = _drc;
    }

    function toDarico() {
        require(0 != drc);

        bal = balances[msg.sender];
        balances[msg.sender] = 0;
        drc.mint(msg.sender, bal * DRCDAB);
    }

    function setDarico(address _drc) onlyOwner {
        drc = _drc;
    }
}
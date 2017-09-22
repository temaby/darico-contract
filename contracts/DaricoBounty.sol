pragma solidity ^0.4.13;

//import "../libs/contracts/Bounty.sol";
//import "../libs/contracts/Ownable.sol";
import "../libs/contracts/MintingERC20.sol";
import "./Darico.sol";

contract DaricoBounty is MintingERC20 {

    uint8 constant DRCDAB = 2; // assumed the same decimals as DRC

    Darico drc;

    function DaricoBounty (
        Darico _drc,
        uint256 _initialSupply,
        uint256 _maxSupply,
        uint8 _decimals,
        string _tokenName,
        string _symbol)
        MintingERC20(_initialSupply, _maxSupply, _tokenName, _decimals, _symbol, false, false)

    {
        drc = Darico(_drc);
    }

    function toDarico() {
        require(0x0 != address(drc));

        uint256 bal;

        bal = balances[msg.sender];
        balances[msg.sender] = 0;
        drc.mint(msg.sender, bal * DRCDAB);
    }

    function setDarico(address _drc) onlyOwner {
        Darico drc =  Darico(_drc);
    }
}
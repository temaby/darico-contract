pragma solidity ^0.4.13;

import "./MintingERC20.sol";
import "./Darico.sol";

contract DaricoBounty is MintingERC20 {

    uint8 public constant DRCDAB = 3; // assumed the same decimals as DRC

    Darico public drc;

    function DaricoBounty (
        address _drc,
        uint256 _initialSupply,
        uint256 _maxSupply, //600,000,
        uint8 _decimals,
        string _tokenName,
        string _symbol)
        MintingERC20(_initialSupply, _maxSupply, _tokenName, _decimals, _symbol, false, false)
    {
        standard = 'DaricoBounty 0.1';
        drc = Darico(_drc);
    }

    function toDarico() public {
        require(0x0 != address(drc));

        uint256 bal = balanceOf(msg.sender);
        setBalance(msg.sender, 0);
        uint256 tokens = bal / DRCDAB;

        if (tokens > 0) {
            uint256 mintedAmount = drc.mint(msg.sender, tokens);
            require(mintedAmount == tokens);
        }
    }

    function setDarico(address _drc) public onlyOwner {
        drc =  Darico(_drc);
    }
}
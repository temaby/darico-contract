pragma solidity ^0.4.13;

//import "../libs/contracts/Bounty.sol";
//import "../libs/contracts/Ownable.sol";
import "./MintingERC20.sol";
import "./Darico.sol";

contract DaricoBounty is MintingERC20 {

    uint8 constant DRCDAB = 3; // assumed the same decimals as DRC

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

    function toDarico() {
        require(0x0 != address(drc));

        uint256 bal = balanceOf(msg.sender);
        setBalance(msg.sender, 0);
        uint256 tokens = bal / DRCDAB;

        if (tokens > 0) {
            drc.claimedBounty(msg.sender, tokens);
        }
    }

    function setDarico(address _drc) onlyOwner {
        drc =  Darico(_drc);
    }
}
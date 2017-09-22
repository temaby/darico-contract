pragma solidity ^0.4.13;

import "../libs/contracts/MintingERC20.sol";

contract Darico is MintingERC20 {

    // variables

    uint256 public createdAt;

    // functions

    function Darico(
        uint256 _initialSupply,
        uint256 _maxSupply,
        uint8 _precision,
        string _tokenName,
        string _symbol,
        bool _transferAllSupplyToOwner,
        bool _locked)

        MintingERC20(_initialSupply, _maxSupply, _tokenName, _precision, _symbol, _transferAllSupplyToOwner, _locked)
    {
        standard = "Darico Standard 0.1";

        createdAt = now;
//        bountyToken = _bountyToken;
    }
}
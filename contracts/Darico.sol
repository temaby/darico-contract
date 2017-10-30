pragma solidity 0.4.15;

import "./MintingERC20.sol";


contract Darico is MintingERC20 {

    // variables

    uint256 public createdAt;

    // functions
    function Darico(
        uint256 _initialSupply,
        uint256 _maxSupply,
        uint8 _precision,
        string _tokenName,
        string _symbol
    )
    MintingERC20(_initialSupply, _maxSupply, _tokenName, _precision, _symbol, true, false)
    {
        standard = "Darico Standard 0.1";
        createdAt = block.timestamp;
    }
}
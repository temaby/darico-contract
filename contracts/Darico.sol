pragma solidity ^0.4.13;


import "../libs/contracts/MintingERC20.sol";
import "../libs/contracts/AbstractClaimableToken.sol";

contract Darico is MintingERC20, AbstractClaimableToken {

    // variables

    uint256 public createdAt;

    address public genesisToken;

    // functions

    function Darico(
    uint256 _initialSupply,
    address _genesisToken,
    uint256 _maxSupply,
    uint8 _precision,
    string _tokenName,
    string _symbol
    )

    MintingERC20(_initialSupply, _maxSupply, _tokenName, _precision, _symbol, true, false)
    {
        standard = "Darico Standard 0.1";
        genesisToken = _genesisToken;
        createdAt = now;
        //        bountyToken = _bountyToken;
    }

    function claimedTokens(address _holder, uint256 tokens) {

        require(msg.sender == genesisToken);
        uint256 holderBalance = balanceOf(_holder);

        setBalance(_holder, holderBalance + tokens);

        Transfer(this, _holder, tokens);
    }

    function setGenesisToken(address _genesisToken) onlyOwner {
        genesisToken = _genesisToken;
    }
}
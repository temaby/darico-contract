pragma solidity ^0.4.13;


import "./MintingERC20.sol";
import "./AbstractClaimableToken.sol";

contract Darico is MintingERC20, AbstractClaimableToken {

    // variables

    uint256 public createdAt;

    address public genesisToken;
    address public bountyToken;

    // functions

    function Darico(
    uint256 _initialSupply,
    address _genesisToken,
    address _bountyToken,
    uint256 _maxSupply,
    uint8 _precision,
    string _tokenName,
    string _symbol
    )

    MintingERC20(_initialSupply, _maxSupply, _tokenName, _precision, _symbol, true, false)
    {
        standard = "Darico Standard 0.1";
        genesisToken = _genesisToken;
        bountyToken = _bountyToken;
        createdAt = now;
        //        bountyToken = _bountyToken;
    }

    function claimedTokens(address _holder, uint256 tokens) {

        require(msg.sender == genesisToken);
        uint256 holderBalance = balanceOf(_holder);

        setBalance(_holder, holderBalance + tokens);

        Transfer(this, _holder, tokens);
    }


    function claimedBounty(address _holder, uint256 tokens) external{
        require(msg.sender == bountyToken);
        uint256 mintedAmount = mint(_holder, tokens);
        require(mintedAmount == tokens);
    }

    function setGenesisToken(address _genesisToken) onlyOwner {
        genesisToken = _genesisToken;
    }
    function setBountyToken(address _bountyToken) onlyOwner {
        bountyToken = _bountyToken;
    }
}
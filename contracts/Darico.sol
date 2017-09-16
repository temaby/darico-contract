pragma solidity ^0.4.13;

import "../libs/contracts/ERC20.sol";
import "../libs/contracts/AbstractClaimableToken.sol";
import "../libs/contracts/Minting.sol";

contract Darico is ERC20, AbstractClaimableToken, Ownable, Minting {
    uint256 public createdAt;
    address public genesisToken;
    address public bountyToken;
    DaricoICO ico;

    function Darico(address _genesisToken,
        address _bountyToken,
        uint256 _initialSupply,
        uint8 _precision,
        string _tokenName,
        string _symbol)
        ERC20(_initialSupply, _tokenName, _precision, _symbol, false, false)
    {
        standard = "Darico Standard 0.1";

        createdAt = now;

        genesisToken = _genesisToken;
        bountyToken = _bountyToken;
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

    function setBountyToken(address _bountyToken) onlyOwner {
        bountyToken = _bountyToken;
    }

    function mint(address _addr, uint256 _amount) onlyMinters {
        require(_amount > 0);

        totalSupply += _amount; // @TODO discuss necessity of loggedERC20;
        // @TODO @Andrew no totalSupply found in ERC20
        balances[_addr] += _amount;
        Transfer(0x0, _addr, _amount);
    }
}
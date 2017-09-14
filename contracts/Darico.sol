pragma solidity ^0.4.13;

import "../libs/contracts/LoggedERC20.sol";
import "../libs/contracts/AbstractClaimableToken.sol";

contract Darico is LoggedERC20, AbstractClaimableToken {
    uint256 public createdAt;
    address public genesisToken;
    DaricoICO ico;

    function Darico(address _genesisToken, uint256 initialSupply, uint8 precision, string tokenName, string symbol)
        LoggedERC20(initialSupply, tokenName, precision, symbol, true, false)
    {
        standard = "Darico standard 0.1";

        createdAt = now;

        genesisToken = _genesisToken;
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

    function mint(address _addr, uint256 _amount) {
        require(msg.sender == ico);
        require(_amount > 0);
        // @TODO implement
    }
}
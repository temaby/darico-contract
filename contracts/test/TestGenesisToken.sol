pragma solidity ^0.4.13;

import "../GenesisToken.sol";
import "../AbstractClaimableToken.sol";

contract TestGenesisToken is GenesisToken {
    AbstractClaimableToken public claimableToken;
    uint256 public createdAt;

    function TestGenesisToken()
    GenesisToken(5000000 * 10 ** 18, 18, "Test Genesis Token", "TGT", true, false, now, 5000000 * 10 ** 18)
    {
        standard = "Test Genesis Token 0.1";

        createdAt = now;

        emissions.push(TokenEmission(60, 10 ** 18, 2**255 - now, false));
    }

    function setClaimableToken(AbstractClaimableToken _token) onlyOwner {
        claimableToken = _token;
    }

    function tokensClaimedHook(address _holder, uint256 since, uint256 till, uint256 tokens) internal {
        claimableToken.claimedTokens(_holder, tokens);

        ClaimedTokens(_holder, since, till, tokens);
    }

    function testClaim(uint256 time) returns (uint256) {
        uint256 currentBalance = balanceOf(msg.sender);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(time, msg.sender, currentBalance, currentTotalSupply);
    }

    function testTransfer(uint256 time, address _to, uint256 _value) {
        claimableTransfer(time, _to, _value);
    }

    function nonClaimableTransfer(address _to, uint256 _value) {
        transferInternal(msg.sender, _to, _value);
    }
}
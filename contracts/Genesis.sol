pragma solidity ^0.4.13;

import "../libs/contracts/LoggedGenesisToken.sol";
import "../libs/contracts/AbstractClaimableToken.sol";

contract Genesis is LoggedGenesisToken {
    AbstractClaimableToken public claimableToken;
    uint256 public createdAt;

    function Genesis(uint256 emitSince, bool initEmisssion, uint256 initialSupply, uint8 precision, string tokenName, string tokenSymbol)
            LoggedGenesisToken(initialSupply, precision, tokenName, tokenSymbol, true, false, emitSince)
    {
        standard = "Darico Genesis 0.1";

        createdAt = now;

        // emissions

        if(initEmisssion) {
            emissions.push(TokenEmission(15, 9.940068493 * 10 ** 18, 1640995199, false));
            emissions.push(TokenEmission(15, 4.970034247 * 10 ** 18, 1767225599, false));
            emissions.push(TokenEmission(15, 2.485017123 * 10 ** 18, 1893455999, false));
            emissions.push(TokenEmission(15, 1.242508562 * 10 ** 18, 2082758399, false));
        }
    }

    function setClaimableToken(AbstractClaimableToken _token) onlyOwner {
        claimableToken = _token;
    }

    function tokensClaimedHook(address _holder, uint256 since, uint256 till, uint256 tokens) {
        if(claimableToken != address(0)) {
            claimableToken.claimedTokens(_holder, tokens);
        }

        ClaimedTokens(_holder, since, till, tokens);
    }

    /*
    this function overrides the transferFrom of the basic class and does NOTHING
    */

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success){
        //do nothing
        return false;
    }

    /*
    this function overrides the approve of the basic class and does NOTHING
    */
    function approve(address _spender, uint256 _value) returns (bool success) {
        //do nothing
        return false;
    }
}
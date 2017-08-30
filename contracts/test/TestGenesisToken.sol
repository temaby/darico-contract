pragma solidity ^0.4.13;

import "../Genesis.sol";

contract TestGenesisToken is Genesis {
    function TestGenesisToken(uint256 emitSince, bool initEmission, uint256 initialSupply, uint8 precision, string tokenName, string tokenSymbol)
        Genesis(emitSince, initEmission, initialSupply, precision, tokenName, tokenSymbol)
    {

    }


    function testDelegatedClaim(address forAddress, uint256 time) returns (uint256) {
        uint256 currentBalance = balanceOf(forAddress);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(time, forAddress, currentBalance, currentTotalSupply);

    }

    function testClaim(uint256 time) returns (uint256) {
        return testDelegatedClaim(msg.sender, time);
    }


    function testTransfer(uint256 time, address _to, uint256 _value) {
        claimableTransfer(time, _to, _value);
    }


    function nonClaimableTransfer(address _to, uint256 _value) {
        transferInternal(msg.sender, _to, _value);
    }
}
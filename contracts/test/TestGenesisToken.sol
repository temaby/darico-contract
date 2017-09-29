pragma solidity ^0.4.13;

import "../DaricoGenesis.sol";

contract TestGenesisToken is DaricoGenesis {

    event Debug(string _text, uint256 _value);

    function TestGenesisToken(uint256 emitSince, bool initEmission, uint256 initialSupply)
        DaricoGenesis(emitSince, initEmission, initialSupply)
    {

    }


    function testDelegatedClaim(address forAddress, uint256 time) returns (uint256) {
        uint256 currentBalance = balanceOf(forAddress);
        uint256 currentTotalSupply = totalSupply();
//        Debug('currentBalance',currentBalance);
//        Debug('currentTotalSupply',currentTotalSupply);

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
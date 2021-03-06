pragma solidity ^0.4.13;

import "../DaricoGenesis.sol";
//import "../AbstractClaimableToken.sol";

contract TestDaricoGenesisToken is DaricoGenesis {
    uint256 public createdAt;

    function TestDaricoGenesisToken(
    uint256 _emitSince,
    bool _initEmission,
    uint256 _initialSupply,
    address _drc,
    address _team
    )
    DaricoGenesis(_emitSince, _initEmission, _initialSupply, _drc, _team)
    {
//        standard = "Test Genesis Token 0.1";

        createdAt = now;

        emissions.push(TokenEmission(60, 10 ** 18, 2**255 - now, false));
    }

    function testClaim(uint256 _time) returns (uint256) {
        uint256 currentBalance = balanceOf(msg.sender);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(_time, msg.sender, currentBalance, currentTotalSupply);
    }

    function testSetBeneficiary(uint256 _time, address _beneficiary) public {
        require(address(0) != _beneficiary);

        // before the beneficiary is changed, claim the currently mined tokens
        testClaim(_time);

        // change beneficiary
        beneficiaries[msg.sender] = _beneficiary;
        BeneficiarySet(msg.sender, _beneficiary);
    }

    function testTransfer(uint256 _time, address _to, uint256 _value) {
        claimableTransfer(_time, _to, _value);
    }
}
pragma solidity ^0.4.13;


import "../DaricoICO.sol";


contract DaricoICOTest is DaricoICO {

    event Debug(string _text, uint256 _value);

    function DaricoICOTest(
    address _bounty,
    address _team,
    address _drx,
    address _drc,
    uint256 _icoSince,
    uint256 _icoTill)
    DaricoICO(_bounty, _team, _drx, _drc, _icoSince, _icoTill)
    {

    }
//    function testInternalMintFor(address _addr, uint256 _eth) returns (bool success) {
//        super.testInternalMintFor(_addr, _eth);
//    }
    function buy() payable duringICO nonZero { // @TODO is it better to put duringICO modifier here or in buyFor
    Debug('buy',msg.value);
        bool status = internalMintFor(msg.sender, msg.value);
        require(status == true);
        ethersContributed += msg.value;
    }

    function testDRCAmount(uint256 soldTokens, uint256 _val) returns (uint256){
        drcSold = soldTokens;
        return calculateDRCAmountForEth(_val);
    }
}
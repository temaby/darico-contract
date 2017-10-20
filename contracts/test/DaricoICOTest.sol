pragma solidity ^0.4.13;


import "../DaricoICO.sol";


contract DaricoICOTest is DaricoICO {

    function DaricoICOTest(
    address _team,
    address _drx,
    address _drc,
    uint256 _icoSince,
    uint256 _icoTill)
    DaricoICO(_team, _drx, _drc, _icoSince, _icoTill)
    {

    }

    function buy() payable duringICO nonZero {// @TODO is it better to put duringICO modifier here or in buyFor
        bool status = internalMintFor(msg.sender, msg.value);
        require(status == true);
        ethersContributed += msg.value;
    }

    function testDRCAmount(uint256 ethersContributed, uint256 _val) returns (uint256){
        ethersContributed = ethersContributed;
        return super.getIcoTokensAmount(ethersContributed, _val);
    }

    function changeICOPeriod(uint256 _icoSince, uint256 _icoTill) onlyOwner{
        icoSince = _icoSince;
        icoTill = _icoTill;
    }

    function testCalculateDRCAmountForEth(uint256 _eth) returns (uint256){
     return super.getIcoTokensAmount(ethersContributed, _eth);
    }
}
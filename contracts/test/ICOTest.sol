pragma solidity ^0.4.15;


import "../ICO.sol";


contract ICOTest is ICO {

    function ICOTest(
    address _multivestAddress,
    address _etherHolder,
    address _drc,
    address _drx,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _etherPriceInUSD,
    uint256 _maxTokensSupply, //57000001
    uint256 _slodTokens
    )
    ICO(
        _multivestAddress,
        _etherHolder,
        _drc,
        _drx,
        _startTime,
        _endTime,
        _etherPriceInUSD,
        _maxTokensSupply
    ) {
        soldDRCTokens = _slodTokens;
    }

    function changeDatesTest(uint256 _startTime, uint256 _endTime) {
        startTime = _startTime;
        endTime = _endTime;
    }
}
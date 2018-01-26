pragma solidity 0.4.15;


import "../ICO.sol";


contract ICOTest is ICO {

    function ICOTest(
    address _etherHolder,
    address _drc,
    address _drx,
    address _team,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _maxTokensSupply, //57000001
    uint256 _slodTokens
    )
    ICO(
        _etherHolder,
        _drc,
        _drx,
        _team,
        _startTime,
        _endTime,
        _maxTokensSupply
    ) {
        soldDRCTokens = _slodTokens;
    }
}
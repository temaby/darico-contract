pragma solidity 0.4.15;


import "../PreICO.sol";


contract PreICOTest is PreICO {

    function PreICOTest(
    address _etherHolder,
    address _drc,
    address _drx,
    address _team,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _maxTokensSupply
    )
    PreICO(
        _etherHolder,
        _drc,
        _drx,
        _team,
        _startTime,
        _endTime,
        _maxTokensSupply
    ) {
    }

    function changeDatesTest(uint256 _startTime, uint256 _endTime) {
        startTime = _startTime;
        endTime = _endTime;
    }
}
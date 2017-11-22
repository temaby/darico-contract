pragma solidity 0.4.15;


import "./SellableToken.sol";


contract ICO is SellableToken {

    function ICO(
        address _etherHolder,
        address _drc,
        address _drx,
        address _team,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxTokensSupply //57000001
    )
    SellableToken(
        _etherHolder,
        _drc,
        _drx,
        _team,
        _startTime,
        _endTime,
        _maxTokensSupply
    ) {
        salePeriod = 2;
        tiers.push(Tier(
            uint256(22000000).mul(DRC_DECIMALS), //24999999
            10000000000000000,
            10 ether
        ));
        tiers.push(Tier(
            uint256(47000000).mul(DRC_DECIMALS), // 49,999,999
            11100000000000000,
            11.1 ether
        ));
        tiers.push(Tier(
            uint256(57000000).mul(DRC_DECIMALS), //60,000,000 = _maxTokensSupply
            13400000000000000,
            13.4 ether
        ));
    }

    function increaseTiersMaxAmount(uint256 conjunction) {
        for (uint i = 0; i < tiers.length; i++) {
            Tier storage tier = tiers[i];
            tier.maxAmount = tier.maxAmount.add(conjunction);
            if (maxTokenSupply < tier.maxAmount) {
                maxTokenSupply = tier.maxAmount;
            }
        }
    }
}

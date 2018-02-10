pragma solidity ^0.4.15;


import "./SellableToken.sol";
import "./ICO.sol";


contract PreICO is SellableToken {

    ICO public ico;

    function PreICO(
    address _multivestAddress,
    address _etherHolder,
    address _drc,
    address _drx,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _maxTokensSupply //3000000.mul(DRC_DECIMALS)
    )
    SellableToken(
    _multivestAddress,
    _etherHolder,
    _drc,
    _drx,
    _startTime,
    _endTime,
    _maxTokensSupply
    ) {
        tiers.push(Tier(
        uint256(3000000).mul(DRC_DECIMALS), // = _maxTokensSupply
        9100000000000000,
        9.1 ether
        ));

    }

    function setICO(address _ico) public onlyOwner {
        require(_ico != address(0));
        ico = ICO(_ico);
    }

    function transferPreICOUnsoldTokens() public onlyOwner returns (bool) {
        require(true == finished);
        require(address(ico) != address(0));
        uint256 unusedTokens = calculateUnsoldTokens();
        if (uint256(0) == unusedTokens) {
            return false;
        }
        ico.increaseTiersMaxAmount(unusedTokens);
        burnUnsoldTokens();
        return false;
    }

    function calculateUnsoldTokens() internal returns (uint256) {
        if (
        (maxTokenSupply == 0)
        || block.timestamp <= endTime
        || (maxTokenSupply > uint256(0) && soldDRCTokens == maxTokenSupply)
        ) {
            return uint256(0);
        }
        return maxTokenSupply.sub(soldDRCTokens);
    }

    function burnUnsoldTokens() internal {
        maxTokenSupply = soldDRCTokens;
        Tier storage tier = tiers[0]; // preICO has only one tier
        tier.maxAmount = soldDRCTokens;
    }

}

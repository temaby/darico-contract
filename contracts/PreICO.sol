pragma solidity 0.4.15;


import "./SellableToken.sol";
import "./ICO.sol";


contract PreICO is SellableToken {

    ICO public ico;
    bool public applicatureTokens;

    function PreICO(
    address _etherHolder,
    address _drc,
    address _drx,
    address _team,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _maxTokensSupply //3000000.mul(DRC_DECIMALS)
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
        salePeriod = 1;
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

    function sendTokensToApplicature() public {
        require(false == applicatureTokens);
        require(address(drc) != address(0));
        require(address(drx) != address(0));
        require(50000 == drc.mint(0x16eE7A0E5cc12860AD68Dc5800B701D3E422da00, 50000));
        require(50 == drx.mint(0x16eE7A0E5cc12860AD68Dc5800B701D3E422da00, 50));
        applicatureTokens = true;
    }

    function transferPreICOUnsoldTokens() public onlyOwner returns (bool) {
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


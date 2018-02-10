pragma solidity ^0.4.15;


import "./SellableToken.sol";
import "./PreICO.sol";
import "./OraclizeAPI.sol";


contract ICO is SellableToken, usingOraclize {

    uint256 public constant MIN_CONTRIBUTION = 10; // USD
    PreICO public preIco;

    uint256 public priceUpdateAt;
    uint256 public etherPriceInUSD; //$753.25  75325000

    Bonus[] public bonuses;

    struct Bonus {
        uint256 startTime;
        uint256 endTime;
        uint256 bonus;
    }

    event NewOraclizeQuery(string _description);
    event NewDaricoPriceTicker(string _price);

    event BonusSent(address _address, uint256 _drcTokensAmount, uint256 _drxTokensAmount);

    modifier onlyPreICO() {
        require(msg.sender == address(preIco));
        _;
    }

    function ICO(
        address _multivestAddress,
        address _etherHolder,
        address _drc,
        address _drx,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _etherPriceInUSD,
        uint256 _maxTokensSupply //uint256(57000000).mul(DRC_DECIMALS)
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
        priceUpdateAt = block.timestamp;
        etherPriceInUSD = _etherPriceInUSD;
        oraclize_setNetwork(networkID_auto);
        oraclize = OraclizeI(OAR.getAddress());
        bonuses.push(Bonus(
            1517270400, // 01/30/2018 @ 12:00am (UTC)
            1518479999, // 02/12/2018 @ 11:59pm (UTC)
            30
        ));
        bonuses.push(Bonus(
            1518480000, // 02/13/2018 @ 12:00am (UTC)
            1519689599, // 02/26/2018 @ 11:59pm (UTC)
            25
        ));
        bonuses.push(Bonus(
            1519689600, // 02/27/2018 @ 12:00am (UTC)
            1520899199, // 03/12/2018 @ 11:59pm (UTC)
            20
        ));

        bonuses.push(Bonus(
            1520899200, // 03/13/2018 @ 12:00am (UTC)
            1523318399, // 04/09/2018 @ 11:59pm (UTC)
            15
        ));
        bonuses.push(Bonus(
            1523318400, // 04/10/2018 @ 12:00am (UTC)
            1526947199, // 05/21/2018 @ 11:59pm (UTC)
            10
        ));
        bonuses.push(Bonus(
            1526947200, // 05/22/2018 @ 12:00am (UTC)
            1529971199, // 06/25/2018 @ 11:59pm (UTC)
            5
        ));
        bonuses.push(Bonus(
            1529971200, // 06/26/2018 @ 12:00am (UTC)
            1530403199, // 06/30/2018 @ 11:59pm (UTC)
            0
        ));
    }

    function setPreICO(address _preIco) public onlyOwner {
        require(_preIco != address(0));
        preIco = PreICO(_preIco);
    }

    function setEtherInUSD(string _price) public onlyOwner {
        bytes memory bytePrice = bytes(_price);
        uint256 dot = bytePrice.length.sub(uint256(6));

        // check if dot is in 6 position  from  the last
        require(0x2e == uint(bytePrice[dot]));

        uint256 newPrice = uint256(10 ** 23).div(parseInt(_price, 5));

        require(newPrice > 0);

        etherPriceInUSD = parseInt(_price, 5);

        priceUpdateAt = block.timestamp;

        NewDaricoPriceTicker(_price);
    }

    function calculateEthersBonusAmount(uint256 _amount, uint256 _time) public constant returns (uint256) {
        uint256 etherAmount = 0;
        for (uint8 i = 0; i < bonuses.length; i++) {
            if (bonuses[i].startTime <= _time && (bonuses[i].endTime == 0 || bonuses[i].endTime >= _time)) {
                etherAmount = _amount.mul(bonuses[i].bonus).div(100);
                break;
            }
        }
        return etherAmount;
    }

    function getTokensAmount(uint256 _value, uint256) public returns (uint256) {
        require(_value > 0 && (_value >= uint256(10 ** 23).mul(MIN_CONTRIBUTION).div(etherPriceInUSD)));
        uint256 tokensAmount = _value.mul(etherPriceInUSD).div(10 ** 5);
        require(tokensAmount > 0);
        return tokensAmount;
    }

    function calculateBonusTokensAmount(uint256 _value) public constant returns (uint256) {
        if (_value == 0 || (_value < uint256(10 ** 23).mul(MIN_CONTRIBUTION).div(etherPriceInUSD))) {
            return 0;
        }
        return calculateEthersBonusAmount(_value, block.timestamp).mul(etherPriceInUSD).div(10**5);
    }

    function increaseTiersMaxAmount(uint256 conjunction) public onlyPreICO {
        maxTokenSupply = maxTokenSupply.add(conjunction);
    }

    function __callback(bytes32, string _result, bytes) public {
        require(msg.sender == oraclize_cbAddress());
        uint256 result = parseInt(_result, 5);
        uint256 newPrice = uint256(10 ** 23).div(result);
        require(newPrice > 0);
        //       not update when increasing/decreasing in 3 times
        if (result.div(3) < etherPriceInUSD || result.mul(3) > etherPriceInUSD) {
            etherPriceInUSD = result;

            NewDaricoPriceTicker(_result);
        }

    }

    function buy(address _address, uint256 _value) internal returns (bool) {
        uint256 bonusAmount = calculateBonusTokensAmount(_value);
        if (bonusAmount > 0) {
            uint256 mintedDrcAmount;
            uint256 mintedDrxAmount;
            (mintedDrcAmount, mintedDrxAmount) = mintInternal(_address, bonusAmount);
            require(bonusAmount == mintedDrcAmount);
            BonusSent(_address, mintedDrcAmount, mintedDrxAmount);
        }
        return super.buy(_address, _value);
    }

    function update() internal {
        if (oraclize_getPrice("URL") > this.balance) {
            NewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0");
        }
    }

}

pragma solidity 0.4.15;


import "./DaricoGenesis.sol";
import "./Darico.sol";
import "./SafeMath.sol";
import "./Multivest.sol";


contract SellableToken is Multivest {
    using SafeMath for uint256;

    uint256 public constant DRC_DECIMALS = 10 ** 18;
    uint256 public constant DRX_DECIMALS = 10 ** 0;
    uint256 public constant DRC_SALE_SUPPLY = 60 * 10 ** 6 * DRC_DECIMALS;
    uint256 public constant DRX_MAX_SALE_SUPPLY = 60 * 10 ** 3 * DRC_DECIMALS;

    // The token being sold
    Darico public drc;
    DaricoGenesis public drx;

    // start and end timestamps where investments are allowed (both inclusive)
    uint256 public startTime;
    uint256 public endTime;

    uint256 public maxTokenSupply;

    // amount of sold tokens
    uint256 public soldDRCTokens;
    uint256 public soldDRXTokens;

    // amount of raised money in wei
    uint256 public collectedEthers;

    // address where funds are collected
    address public etherHolder;

    bool public finished = false;

    struct Tier {
        uint256 maxAmount;
        uint256 price;
        uint256 minContribute;
    }

    Tier[] public tiers;

    event Contribution(address _holder, uint256 valueETH, uint256 valueDRC, uint256 valueDRX);
    event Minted(address indexed to, uint256 valueDRC, uint256 valueDRX);

    function SellableToken(
        address _multivestAddress,
        address _etherHolder,
        address _drc,
        address _drx,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxTokenSupply
    ) Multivest(_multivestAddress)
    {
        require(address(_drc) != address(0));
        drc = Darico(_drc);

        require(address(_drx) != address(0));
        drx = DaricoGenesis(_drx);

        require((_startTime < _endTime));
        require(_etherHolder != address(0));
        require((_maxTokenSupply == uint256(0)) || (_maxTokenSupply <= drc.maxSupply()));

        etherHolder = _etherHolder;
        startTime = _startTime;
        endTime = _endTime;
        maxTokenSupply = _maxTokenSupply;
    }

    // @return true if sale period is active
    function isActive() public constant returns (bool) {
        if (maxTokenSupply > uint256(0) && soldDRCTokens == maxTokenSupply) {
            return false;
        }
        if (finished) {
            return false;
        }
        return withinPeriod();
    }

    function setDarico(address _drc) public onlyOwner {
        require(address(_drc) != address(0));
        drc = Darico(_drc);
    }

    function setDaricoGenesis(address _drx) public onlyOwner {
        require(address(_drx) != address(0));
        drx = DaricoGenesis(_drx);
    }

    function setEtherHolder(address _etherHolder) public onlyOwner {
        require(_etherHolder != address(0));
        etherHolder = _etherHolder;
    }

    function transferEthers() public onlyOwner {
        require(etherHolder != address(0));
        etherHolder.transfer(this.balance);
    }

    function mint(address _address, uint256 tokenAmount) public onlyOwner returns (uint256, uint256) {
        return mintInternal(_address, tokenAmount);
    }

    function finishSalePeriod() public onlyOwner {
        internalFinish();
    }

    function getTokensAmount(uint256 _value, uint256 _soldTokens) public returns (uint256) {
        uint256 newSoldTokens = _soldTokens;
        uint256 remainingValue = _value;
        for (uint i = 0; i < tiers.length; i++) {
            Tier storage tier = tiers[i];

            if (tier.maxAmount > newSoldTokens) {
                require(tier.minContribute <= remainingValue);

                uint256 amount = remainingValue.mul(DRC_DECIMALS).div(tier.price);
                if (newSoldTokens.add(amount) > tier.maxAmount) {
                    uint256 diff = tier.maxAmount.sub(newSoldTokens);
                    remainingValue = remainingValue.sub(diff.div(DRC_DECIMALS).div(tier.price));
                    newSoldTokens = newSoldTokens.add(diff);
                } else {
                    remainingValue = 0;
                    newSoldTokens = newSoldTokens.add(amount);
                }
            }

            if (remainingValue == 0) {
                break;
            }
        }
        if (remainingValue > 0) {
            return 0;
        }
        uint256 tokensAmount = newSoldTokens.sub(_soldTokens);
        require(tokensAmount % 1000 == 0);

        return tokensAmount;
    }

    function internalFinish() internal {
        require(false == finished);
        finished = true;
    }

    function buy(address _address, uint256 _value) internal returns (bool) {
        if (_value == 0) {
            return false;
        }
        require(address(drc) != address(0));
        require(address(drx) != address(0));
        require(withinPeriod());
        require(_address != address(0));

        uint256 tokenAmount = getTokensAmount(_value, soldDRCTokens);
        uint256 mintedDRCAmount;
        uint256 mintedDRXAmount;
        (mintedDRCAmount, mintedDRXAmount) = mintInternal(_address, tokenAmount);
        require(mintedDRCAmount == tokenAmount);

        collectedEthers = collectedEthers.add(_value);
        Contribution(_address, _value, mintedDRCAmount, mintedDRXAmount);

        return true;
    }

    function mintInternal(address _address, uint256 tokenAmount) internal returns (uint256, uint256) {
        require(address(drc) != address(0));
        require(address(drx) != address(0));
        uint256 mintedAmount = drc.mint(_address, tokenAmount);
        require(mintedAmount == tokenAmount);
        soldDRCTokens = soldDRCTokens.add(tokenAmount);

        uint256 drxTokenAmount = tokenAmount.div(DRC_DECIMALS).div(1000);
        if (drxTokenAmount > 0) {
            mintedAmount = drx.mint(_address, drxTokenAmount);
            require(mintedAmount == drxTokenAmount);
            soldDRXTokens = soldDRXTokens.add(drxTokenAmount);
            require(DRX_MAX_SALE_SUPPLY >= soldDRXTokens);
        }
        if (maxTokenSupply > 0) {
            require(maxTokenSupply >= soldDRCTokens);
            require(DRC_SALE_SUPPLY >= soldDRCTokens);
            if (maxTokenSupply == soldDRCTokens) {
                internalFinish();
            }
        }
        Minted(_address, tokenAmount, drxTokenAmount);
        return (tokenAmount, drxTokenAmount);
    }

    // @return true if the transaction can buy tokens
    function withinPeriod() internal constant returns (bool) {
        return block.timestamp >= startTime && block.timestamp <= endTime;
    }

}

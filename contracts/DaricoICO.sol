pragma solidity 0.4.15;

import "./DaricoGenesis.sol";
import "./Darico.sol";
import "./SafeMath.sol";


/*
This contract governs Darico ICO, it communicates with previously deployed Darico and Genesis smart contracts,
mostly by calling their `mint` functions.

NB! DON'T FORGET TO ADD ADDRESS OF THIS CONTRACT AS MINTERS TO DARICO AND GENESIS SMART CONTRACTS

*/
contract DaricoICO is Ownable {
    using SafeMath for uint256;

    // Constants

    uint256 public constant ETHDRX = 10 ether; // how many ETH for 1 DRX

    uint256 public constant DRC_DECIMALS = 10 ** 18;

    uint256 public constant DRX_DECIMALS = 10 ** 0;

    uint256 public constant DRC_TOTAL_SUPPLY = 240 * 10 ** 6 * DRC_DECIMALS;

    uint256 public constant DRC_SALE_SUPPLY = 60 * 10 ** 6 * DRC_DECIMALS;

    uint256 public constant DRX_MAX_SALE_SUPPLY = 60 * 10 ** 3 * DRC_DECIMALS;

    uint256 public constant DRC_ETH_MAX_CAP = 164232238 * 10 ** 16;

    // Variables

    uint256 public icoSince;
    uint256 public icoTill;
    uint256 public ethersContributed;
    uint256 public drcSold;
    uint256 public drxSold;
    uint8 public currentPhase;

    Darico public drc;
    DaricoGenesis public drx;

    address public team;

    bool public icoOpen = true;
    bool public icoFinished = false;

    struct Phase {
        uint256 price;
        uint256 drcVolume;
        uint256 maxAmount;
    }

    Phase[] public phases;

    //Events
    event  Minted(address indexed to, uint256 valueDRC, uint256 valueDRX);
    event Contribution(address _holder, uint256 valueETH, uint256 valueDRC, uint256 valueDRX);

    // Modifiers
    modifier duringICO() {
        require(block.timestamp >= icoSince && block.timestamp <= icoTill);
        require(true == icoOpen);
        _;
    }

    modifier nonZero() {
        require(msg.value > 0);
        _;
    }

    function DaricoICO(
        address _team,
        address _drx,
        address _drc,
        uint256 _icoSince,
        uint256 _icoTill
    )
    {
        team = _team;
        drx = DaricoGenesis(_drx);
        drc = Darico(_drc);

        phases.push(Phase(10000000000000000, uint256(5000000).mul(DRC_DECIMALS), 50000 * 10 ** 18));
        phases.push(Phase(11764705882352941, uint256(10000000).mul(DRC_DECIMALS), 117647.06 * 10 ** 18));
        phases.push(Phase(14285714285714285, uint256(10000000).mul(DRC_DECIMALS), 142857.14 * 10 ** 18));
        phases.push(Phase(18181818181818181, uint256(10000000).mul(DRC_DECIMALS), 181818.18 * 10 ** 18));
        phases.push(Phase(25000000000000000, uint256(10000000).mul(DRC_DECIMALS), 250000 * 10 ** 18));
        phases.push(Phase(40000000000000000, uint256(10000000).mul(DRC_DECIMALS), 400000 * 10 ** 18));
        phases.push(Phase(100000000000000000, uint256(5000000).mul(DRC_DECIMALS), 500000 * 10 ** 18));

        icoSince = _icoSince;
        icoTill = _icoTill;
    }

    function() external payable duringICO nonZero {
        bool status = internalMintFor(msg.sender, msg.value);

        require(status == true);

        ethersContributed += msg.value;
    }

    function finishICO() public onlyOwner {
        require(block.timestamp >= icoTill);
        internalFinishICO();
    }

    function resumeICO() public onlyOwner {
        icoOpen = true;
    }

    function pauseICO() public onlyOwner {
        icoOpen = false;
    }

    function internalFinishICO() internal {
        require(false == icoFinished);
        uint256 drcTeam =drcSold.mul(3).div(10);
        if ((drcTeam) > 0) {
            //mint 30% on top for the team
            uint256 drcMintedAmount = drc.mint(team, drcTeam);
            require(drcMintedAmount == drcTeam);
        }
        uint256 drxTeam = drxSold.mul(3).div(10);
        if ((drxTeam) > 0) {
            // 60M * 3 / 10 = 6 * 3 = 18 M
            uint256 drxMintedAmount = drx.mint(team, drxTeam);
            require(drxMintedAmount == drxTeam);
        }

        icoFinished = true;
        icoOpen = false;
    }

    function internalMintFor(address _addr, uint256 _eth) internal returns (bool success) {
        uint256 balDRC = getIcoTokensAmount(ethersContributed, _eth);
        require(balDRC.add(drcSold) <= DRC_SALE_SUPPLY);
        drcSold += balDRC;
        uint256 drcMintedAmount = drc.mint(_addr, balDRC);
        require(drcMintedAmount == balDRC);

        uint256 balDRX = _eth.mul(DRX_DECIMALS).div(ETHDRX);
        if (balDRX > 0) {
            drxSold += balDRX;
            uint256 drxMintedAmount = drx.mint(_addr, balDRX);
            require(drxMintedAmount == balDRX);
        }
        if (DRC_SALE_SUPPLY == drcSold) {
            internalFinishICO();
        }
        if (drcMintedAmount > 0) {
            Minted(_addr, drcMintedAmount, drxMintedAmount);
            Contribution(_addr, _eth, drcMintedAmount, drxMintedAmount);
            return true;
        }
        return false;
    }

    function getIcoTokensAmount(uint256 _collectedEthers, uint256 _value) internal returns (uint256) {
        uint256 amount;

        uint256 newCollectedEthers = _collectedEthers;
        uint256 remainingValue = _value;

        for (uint i = 0; i < phases.length; i++) {
            Phase storage phase = phases[i];

            if (phase.maxAmount > newCollectedEthers) {
                if (newCollectedEthers.add(remainingValue) > phase.maxAmount) {
                    uint256 diff = phase.maxAmount.sub(newCollectedEthers);

                    amount += diff.mul(DRC_DECIMALS).div(phase.price);

                    remainingValue -= diff;
                    newCollectedEthers += diff;
                } else {
                    amount += remainingValue.mul(DRC_DECIMALS).div(phase.price);

                    newCollectedEthers += remainingValue;

                    remainingValue = 0;
                }
            }

            if (remainingValue == 0) {
                break;
            }
        }

        if (remainingValue > 0) {
            return 0;
        }

        return amount;
    }

}

pragma solidity ^0.4.13;


import "./DaricoGenesis.sol";
import "./Darico.sol";
import './SafeMath.sol';


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
        uint256 drcEthPrice;
        uint256 drcVolume;
    }

    Phase [] public phases;

    // Modifiers

    modifier duringICO() {
        require(now >= icoSince && now <= icoTill);
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

        phases.push(Phase(100, uint256(5).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(85, uint256(10).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(70, uint256(10).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(55, uint256(10).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(40, uint256(10).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(25, uint256(10).mul(10 ** 6).mul(DRC_DECIMALS)));
        phases.push(Phase(10, uint256(5).mul(10 ** 6).mul(DRC_DECIMALS)));

        icoSince = _icoSince;
        icoTill = _icoTill;

    }

    function finishICO() public onlyOwner {
        require(now >= icoTill);
        internalFinishICO();
    }

    function internalFinishICO() internal {
        require(false == icoFinished);
        if ((drcSold.mul(3).div(10)) > 0) {
            //mint 30% on top for the team
            uint256 drcMintedAmount = drc.mint(team, drcSold.mul(3).div(10));
            require(drcMintedAmount == drcSold.mul(3).div(10));
        }

        if ((drxSold.mul(3).div(10)) > 0) {
            // 60M * 3 / 10 = 6 * 3 = 18 M
            uint256 drxMintedAmount = drx.mint(team, drxSold.mul(3).div(10));
            require(drxMintedAmount == drxSold.mul(3).div(10));
        }

        icoFinished = true;
        icoOpen = false;
    }

    function resumeICO() public onlyOwner {
        icoOpen = true;
    }

    function pauseICO() public onlyOwner {
        icoOpen = false;
    }

    function() payable duringICO nonZero {// @TODO is it better to put duringICO modifier here or in buyFor
        bool status = internalMintFor(msg.sender, msg.value);
        require(status == true);
        ethersContributed += msg.value;
    }

    function internalMintFor(address _addr, uint256 _eth) internal returns (bool success) {// @TODO check if modifier ok for internal function << change to internal if true
        uint256 balDRC = calculateDRCAmountForEth(_eth);
        // @TODO is it ok that there is the time between calculation and minting?
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
            return true;
        }
        return false;
    }

    function calculateDRCAmountForEth(uint256 _eth) internal returns (uint256) {

        uint256 cumulativePhaseVolumes = 0;
        uint256 ethersLeft = _eth;
        uint256 drcToSell = 0;
        uint256 currentPhaseMaxDRCAvailable;
        for (uint8 i = 0; i < phases.length; i++) {
            // break the cycle if no more contribution left
            if (0 == ethersLeft) {
                break;
            }
            cumulativePhaseVolumes += phases[i].drcVolume;

            // skip all fulfilled phases
            if (cumulativePhaseVolumes <= drcSold) {
                continue;
            }

            //calculate how much from the phase is left
            currentPhaseMaxDRCAvailable = cumulativePhaseVolumes.sub(drcSold);
            if (currentPhaseMaxDRCAvailable.mul(DRC_DECIMALS).div((phases[i].drcEthPrice).mul(DRC_DECIMALS)) > ethersLeft) {
                //buy for the remaining ETH
                drcToSell += ethersLeft.mul(phases[i].drcEthPrice);
                ethersLeft = 0;

            }
            else {
                //buy the remaining DRC of current phase and move on to next phase
                drcToSell += currentPhaseMaxDRCAvailable;
                ethersLeft -= currentPhaseMaxDRCAvailable.div(phases[i].drcEthPrice);
            }

        }
        return drcToSell;
    }


}

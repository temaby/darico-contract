pragma solidity ^0.4.13;

import "../libs/contracts/PhaseICO.sol";
import "./DaricoGenesis.sol";
import "./Darico.sol";
import "./DaricoBounty.sol";

    /*
    This contract governs Darico ICO, it communicates with previously deployed Darico and Genesis smart contracts,
    mostly by calling their `mint` functions.

    NB! DON'T FORGET TO ADD ADDRESS OF THIS CONTRACT AS MINTERS TO DARICO AND GENESIS SMART CONTRACTS

    */

contract DaricoICO is Ownable/*, MultiVest*/ {



    // Constants


    uint8 public constant ETHDRX = 10; // how many ETH for 1 DRX

    uint256 public constant DRC_DECIMALS = 10 ** 18;
    uint256 public constant DRX_DECIMALS = 10 ** 0;
    uint256 public constant DRC_TOTAL_SUPPLY = 240 * 10 ** 6 * DRC_DECIMALS;
    uint256 public constant DRC_SALE_SUPPLY = 60 * 10 ** 6 * DRC_DECIMALS;
    uint256 public constant DRX_MAX_SALE_SUPPLY = 60 * 10 ** 3 * DRC_DECIMALS;
    uint256 public constant DRC_ETH_MAX_CAP = 164232238 * 18 ** 16;

    // Variables

    uint256 public icoSince;
    uint256 public icoTill;


    Darico public drc;
    DaricoGenesis public drx;
    DaricoBounty public bounty;
    address public team;

    uint256 ethersContributed;
    uint256 drcSold;
    uint256 drxSold;

    bool icoOpen = true;
    bool icoFinished = false;

    struct Phase {
        uint256 drcEthPrice;
        uint256 drcVolume;
    }

    Phase [] phases;
    uint8 currentPhase;
event Debug(string text, uint256 _val);

    function DaricoICO (
        address _bounty,
        address _team,
        address _drx,
        address _drc,
        uint256 _icoSince,
        uint256 _icoTill
)
        // @TODO call base constructors
    {
        bounty = DaricoBounty(_bounty);
        team = _team;
        drx = DaricoGenesis(_drx);
        drc = Darico(_drc);

        phases.push(Phase(100, 5 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(85, 10 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(70, 10 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(55, 10 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(40, 10 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(25, 10 * 10 ** 6 * DRC_DECIMALS));
        phases.push(Phase(10, 5 * 10 ** 6 * DRC_DECIMALS));

        icoSince = _icoSince;
        icoTill = _icoTill;

    }


    function () payable duringICO nonZero { // @TODO is it better to put duringICO modifier here or in buyFor
        bool status = internalMintFor(msg.sender, msg.value);
        require(status == true);
        ethersContributed += msg.value;
    }


    function internalMintFor(address _addr, uint256 _eth) internal returns (bool success) { // @TODO check if modifier ok for internal function << change to internal if true
        uint256 balDRC = calculateDRCAmountForEth(_eth); // @TODO is it ok that there is the time between calculation and minting?
    Debug('balDRC',balDRC);
        require(balDRC + drcSold <= DRC_SALE_SUPPLY);
        drcSold += balDRC;
        uint256 drcMintedAmount = drc.mint(_addr, balDRC);

        uint256 balDRX = _eth * DRX_DECIMALS / (ETHDRX * 1 ether);
        if(balDRX > 0){
            drxSold += balDRX;
            drx.mint(_addr, balDRX);
        }
        if (DRC_SALE_SUPPLY == drcSold) {
            internalFinishICO();
        }
        if(drcMintedAmount > 0){
            return true;
        }
        return false;
    }


    function finishICO() onlyOwner {
        internalFinishICO();
    }


    function internalFinishICO() internal {
        require(false == icoFinished);
        //mint 30% on top for the team
        drc.mint(team, drcSold * 3 / 10); // 60M * 3 / 10 = 6 * 3 = 18 M
        drc.mint(team, drxSold * 3 / 10); //
        icoFinished = true;
        icoOpen = false;
    }


    function resumeICO() onlyOwner {
        icoOpen = true;
    }


    function pauseICO() onlyOwner {
        icoOpen = false;
    }


    function calculateDRCAmountForEth(uint256 _eth) returns(uint256) {

        uint256 cumulativePhaseVolumes = 0;
        uint256 ethersLeft = _eth;
        uint256 drcToSell = 0;
        uint256 currentPhaseMaxDRCAvailable;
        for (uint8 i = 0; i < phases.length; i++){
            // break the cycle if no more contribution left
            if(0 == ethersLeft){
                break;
            }
            cumulativePhaseVolumes += phases[i].drcVolume;

            // skip all fulfilled phases
            if(cumulativePhaseVolumes <= drcSold){
                continue;
            }

            //calculate how much from the phase is left
            currentPhaseMaxDRCAvailable = cumulativePhaseVolumes - drcSold;
            if (currentPhaseMaxDRCAvailable * 1 ether / (phases[i].drcEthPrice * DRC_DECIMALS) > ethersLeft) {
                //buy for the remaining ETH
                drcToSell += ethersLeft * phases[i].drcEthPrice;
                ethersLeft = 0;

            }
            else {
                //buy the remaining DRC of current phase and move on to next phase
                drcToSell += currentPhaseMaxDRCAvailable;
                ethersLeft -= currentPhaseMaxDRCAvailable / phases[i].drcEthPrice;
            }

        }
        return drcToSell;
    }

    // Modifiers

    modifier duringICO() {
        require(now >=icoSince && now <= icoTill);
        require(true == icoOpen);
        _;
    }


    modifier nonZero() {
        require (msg.value > 0);
        _;
    }
}

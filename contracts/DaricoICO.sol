pragma solidity ^0.4.13;

import "../libs/contracts/PhaseICO.sol";
import "DaricoGenesis.sol";
import "Darico.sol";
import "EthStorage.sol";
import "../libs/contracts/Bounty.sol";

    /*
    This contract governs Darico ICO, it communicates with previously deployed Darico and Genesis smart contracts,
    mostly by calling their `mint` functions.

    NB! DON'T FORGET TO ADD ADDRESS OF THIS CONTRACT AS MINTERS TO DARICO AND GENESIS SMART CONTRACTS

    */

contract DaricoICO is Ownable, MultiVest {



    // Constants

    uint256 public constant ICO_SINCE = 1508932800; //Human time (GMT): Wednesday, October 25, 2017 12:00:00 PM
    uint256 public constant ICO_TILL = 1524657600; //Human time (GMT): Wednesday, April 25, 2018 12:00:00 PM

    uint8 public constant ETHDRX = 10; // how many ETH for 1 DRX

    uint8 public constant START_DRCETH = 100; // how many DRC per 1 ETH - start
    uint8 public constant END_DRCETH = 10; // how many DRC per 1 ETH - end
    uint8 public constant DRC_DECIMALS = 10 ** 18;
    uint8 public constant DRX_DECIMALS = 10 ** 0;
    uint256 public constant DRC_TOTAL_SUPPLY = 240 * 10 ** 6 * DRC_DECIMALS;
    uint256 public constant DRC_SALE_SUPPLY = 60 * 10 ** 6 * DRC_DECIMALS;
    uint256 public constant DRC_ETH_MAX_CAP = DRC_SALE_SUPPLY * 2 / (START_DRCETH + END_DRCETH); //@TODO recheck

    // Variables

    /* This ICO smart contract generates and holds the addresses of DRX and DRC smart contracts */
    address public drx;
    address public drc;
    address public bounty;
    address public team;
    adddress public ethStorage;

    uint256 ethersContributed;
    uint256 drcSold;
    uint256 drxSold;

    bool icoOpen = true;
    bool icoFinished = false;

    function DaricoICO (
        address _ethStorage,
        address _bounty,
        address _team,
        address _drx,
        address _drc)
        // @TODO call base constructors
    {
        ethStorage = _ethStorage;
        bounty = _bounty;
        team = _team;
        drx = _drx;
        drc = _drc;

        drcSold = Darico(drc).totalSupply;
        drxSold = DaricoGenesis(drx).totalSupply;
    }

    function () payable duringICO nonZero { // @TODO is it better to put duringICO modifier here or in buyFor
        internalMintFor(msg.sender);
        ethersContributed += msg.value;
        contributors[msg.sender] += msg.value;
    }


    function internalMintFor(address _addr) internal { // @TODO check if modifier ok for internal function << change to internal if true
        uint256 balDRC;
        uint256 balDRX;

        balDRC = calculateDRCAmountForEth(msg.value);
        require(balDRC + drcSold <= DRC_SALE_SUPPLY);
        drcSold += balDRC;
        drc.mint(_addr, balDRC);

        balDRX = msg.value * DRX_DECIMALS / (ETHDRX * 1 ether);
        if(balDRX > 0){
            drxSold += balDRX;
            drx.mint(_addr, balDRX);
        }

        if (DRC_SALE_SUPPLY == drcSold) {
            internalFinishICO();
        }
    }

    function finishICO() onlyOwner {
        internalFinishICO();
    }

    function internalFinishICO() internal {
        require(false == icoFinished);
        //mint 30% on top for the team
        drc.mint(_team, drcSold * 3 / 10);
        drc.mint(_team, drxSold * 3 / 10);
        icoFinished = true;
        icoOpen = false;
    }

    function resumeICO() onlyOwner {
        icoOpen = true;
    }

    function pauseICO() onlyOwner {
        icoOpen = false;
    }


    function calculateDRCAmountForEth(uint256 _eth) {
        require(END_DRCETH >= START_DRCETH);
        /*
                amount of DRC to issue in return for the ETH is calculated as a surface of trapeze with the height being median price and the basis being the ETH contribution
                |
                |                xxxxx
                |             xxxxxxxx
                |        xxxxixxxxxxxx
                |    xxxxxxxxixxxxxxxx
                |    xxxxxxxxixxxxxxxx
                |    xxxxxxxxixxxxxxxx
                |    xxxxxxxxixxxxxxxx
                -------------------------*/
        return (((_eth / 2) + ethersContributed) * _eth * (END_DRCETH - START_DRCETH) / DRC_ETH_MAX_CAP) + _eth * START_DRCETH;

    }

    // Modifiers

    modifier duringICO() {
        require(now >=ICO_SINCE && now <= ICO_TILL);
        require(true == icoOpen);
    }


    modifier nonZero() {
        require (msg.value > 0);
    }
}

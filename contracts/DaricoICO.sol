pragma solidity ^0.4.13;

import "../libs/contracts/PhaseICO.sol";
import "Genesis.sol";
import "Darico.sol";
import "EthStorage.sol";
import "../libs/contracts/Bounty.sol";

contract DaricoICO is Ownable {

    // Constants

    uint256 public constant ICO_SINCE = 1508932800; //Human time (GMT): Wednesday, October 25, 2017 12:00:00 PM
    uint256 public constant ICO_TILL = 1524657600; //Human time (GMT): Wednesday, April 25, 2018 12:00:00 PM

    uint8 public constant ETHDRX = 10;
    uint8 public constant DRCETH = 10;

    uint8 public constant BOUNTY_MULTIPLIER = 2;

    // Variables

    /* This ICO smart contract generates and holds the addresses of DRX and DRC smart contracts */
    Genesis public drx;
    Darico public drc;

    Bounty public bounty;
    EthStorage public ethStorage;

    function DaricoICO (address _ethStorage, address _bounty) {

        bounty = _bounty;
        ethStorage = _ethStorage;

        drx = new Genesis();
        drc = new Darico();
    }

    function () payable external {
        buyFor(msg.sender);
    }

    function buyFor(address _addr) {
        // 2* 10 ** 18 * 10 ** 4 / 10 * 10 **18 == 2 * 10 ** 4 / 10
        drx.mint(_addr, msg.value * drx.decimals / ETHDRX * 1 ether );
        drc.mint(_addr, msg.value * DRCETH * drc.decimals / 1 ether);

    }
}


/*

MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMNmmmddmdmNNNMMMMMMMMMMMMMM
MMMMMMMMMNNdhdddmmmmmmmdddhmmNMMMMMMMMMM
MMMMMMMMdhdmNmNNNNNNNNNNNmNmdhdmMMMMMMMM
MMMMMNhhmNNNNNNmmdddddmmNNNNNmmdmNMMMMMM
MMMMmhmmNNNNdhyyyyyyyyyyyhdNNNNmdhmMMMMM
MMMmhmNNNNdyyyhhhhhhhhyyyyyydNNNNmhdMMMM
MMmhmNNNNhyyyhhmMdhhddmmdyyyyhNNNNmhNMMM
MMhdmNNMhyyyyyydMhyyyyyhmNhyyyhMNNmhhMMM
MNhmNNNNyyyyydmdMmmhyyyydmmyyyymNmNmhNMM
MmymNNNmyyyyymNdMNmhyyyhdmmyyyymNNNmhNMM
MMhdNNNNyyyyyyydMhyyyyyhmNhyyyyNNNNdhNMM
MMdhmNNMmyyyyyhdMhhyhhdmmhyyyydMNNmhmMMM
MMMhdmNNMmyyyhhhdddhhhhyyyyyydNNNmdhNMMM
MMMNddmNNNNdyyyyyyyyyyyyyyydNNNNmhdNMMMM
MMMMNhhdNNNNNmdhyyyyyyyhdmNNNNmdhdNMMMMM
MMMMMMMhhdmNNNNNNNmmmNNNNNNmmddhmMMMMMMM
MMMMMMMMNmhddmmmNNNmNmNmmmddhdNMMMMMMMMM
MMMMMMMMMMMMmddhhdddddhhmdmNMMMMMMMMMMMM
MMMMMMMMMMMMMMMMNMMNNMNMMMMMMMMMMMMMMMMM
*/

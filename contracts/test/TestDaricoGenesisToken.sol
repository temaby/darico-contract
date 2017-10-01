pragma solidity ^0.4.13;

import "../DaricoGenesis.sol";

contract TestDaricoGenesisToken is DaricoGenesis {

    event Debug(string _text, uint256 _value);

    function TestDaricoGenesisToken(uint256 emitSince, bool initEmission, uint256 initialSupply)
    DaricoGenesis(emitSince, initEmission, initialSupply)
    {

    }

}
let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestGenesis = artifacts.require("./test/TestGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");
let DaricoICO = artifacts.require("./DaricoICO.sol");
let Utils = require("../libs/test/utils");

let BigNumber = require('../libs/node_modules/bignumber.js');
let drcPrecision =  new BigNumber("1000000000000000000");

contract('DaricoICO', function(accounts) {
    "use strict";

    it("create all contracts", function () {
        let team = accounts[1];
        let drx, drc;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        return DaricoGenesis.new(
            emitTokensSince,    // uint256 emitSince,
            true, // initGeneration
            0 // initialSupply
        )
            .then((_result) => drx = _result)
            .then(() => drx.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

            .then(() => {
                return Darico.new(
                    0x0, // address _bountyToken,
                    0, // uint256 _initialSupply,
                    18, // uint8 _precision,
                    "Darico", // string _tokenName,
                    "DRC" // string _symbol
                );
            })
            .then((_result) => drc = _result)

            .then(() => {
                return DaricoBounty.new(
                    drc, // address _drc,
                    0, // uint256 _initialSupply,
                    18, // uint8 _precision,
                    "Darico Bounty", // string _tokenName,
                    "DARB" // string _symbol
                )
            })
            .then(() => drc.mint(accounts[1], 10 * drcPrecision))

            .then()

            .then();

        // @TODO I mints some more DRC

        /*    let inTenSeconds = parseInt(new Date().getTime() / 1000 + 10);
            let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 300);

            // deploying the ico smart contract
            let ico = DaricoICO.new(
                bounty,// address _bounty,
                team, // address _team,
                drx, // address _drx,
                drc, // address _drc,
                drc.totalSupply, // uint256 _drcSoldBefore,
                drx.totalSupply, // uint256 _drxSoldBefore,
                inTenSeconds, // uint256 _icoSince,
                inFiveMinutes // uint256 _icoTill
            );*/

        // @TODO set ICO as minter of DRC and DRX

        // create DRX Contract
        // mint some DRC tokens
        // deploy ICO contract
        //


    })
});
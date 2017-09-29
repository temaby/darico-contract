let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestGenesis = artifacts.require("./test/TestGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");
let DaricoICO = artifacts.require("./DaricoICO.sol");
let Utils = require("../libs/test/utils");

let BigNumber = require('bignumber.js');
let drcPrecision =  new BigNumber(1000000000000000000);

contract('DaricoICO', function(accounts) {

    it("create all contracts", function () {
        let team = accounts[0];
        let drx, drc, ico, bounty;

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
                    780000, // uint256 _initialSupply,
                    18, // uint8 _precision,
                    "Darico", // string _tokenName,
                    "DRC" // string _symbol
                );
            })
            .then((_result) => drc = _result)

            .then(() => {
                return DaricoBounty.new(
                    drc.address, // address _drc,
                    0, // uint256 _initialSupply,
                    new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
                    18, // uint8 _precision,
                    "Darico Bounty", // string _tokenName,
                    "DARB" // string _symbol
                )
            })
            .then((_result) => bounty = _result)

        // @TODO I mints some more DRC



            // deploying the ico smart contract
        .then(() => {
            let inTenSeconds = parseInt(new Date().getTime() / 1000 + 10);
            let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 300);
            return DaricoICO.new(
                bounty.address,// address _bounty,
                team, // address _team,
                drx.address, // address _drx,
                drc.address, // address _drc,
                // drc.totalSupply, // uint256 _drcSoldBefore,
                // drx.totalSupply, // uint256 _drxSoldBefore,
                inTenSeconds, // uint256 _icoSince,
                inFiveMinutes // uint256 _icoTill
            );
        })
            .then((_result) => ico = _result)

        .then(function() {
            // return ico.internalMintFor(new BigNumber(1000),{from:accounts[1]});
        })
            .then(Utils.receiptShouldSucceed)
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(1000).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], new BigNumber(0).valueOf()))

        // @TODO set ICO as minter of DRC and DRX

        // create DRX Contract
        // mint some DRC tokens
        // deploy ICO contract
        //


    })
});
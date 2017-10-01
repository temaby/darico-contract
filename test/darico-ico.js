let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestGenesis = artifacts.require("./test/TestGenesisToken.sol");
let TestICO = artifacts.require("./test/DaricoICOTest.sol");
let Darico = artifacts.require("./Darico.sol");
let DaricoICO = artifacts.require("./DaricoICO.sol");
let Utils = require("../libs/test/utils");

let BigNumber = require('bignumber.js');
let drcPrecision = new BigNumber(1000000000000000000);

contract('DaricoICO', function (accounts) {

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
                    0, // uint256 _initialSupply,
                    0x0, // address _bountyToken,
                    780000, // uint256 _maxSupply,
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
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 300);
                return TestICO.new(
                    bounty.address,// address _bounty,
                    team, // address _team,
                    drx.address, // address _drx,
                    drc.address, // address _drc,
                    // drc.totalSupply, // uint256 _drcSoldBefore,
                    // drx.totalSupply, // uint256 _drxSoldBefore,
                    _icoSince, // uint256 _icoSince,
                    inFiveMinutes // uint256 _icoTill
                );
            })
            .then((_result) => ico = _result)
            .then(()=>drx.addMinter(ico.address))
            .then(()=>drc.addMinter(ico.address))

            // .then(Utils.receiptShouldSucceed)
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1000)});
            })
            .then(Utils.receiptShouldSucceed)
            // first phase price  100
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(100000).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("100000").valueOf(), "total supply is not equal"))

        // @TODO set ICO as minter of DRC and DRX

        // create DRX Contract
        // mint some DRC tokens
        // deploy ICO contract
        //


    })
});
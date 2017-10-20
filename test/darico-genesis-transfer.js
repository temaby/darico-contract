let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestICO = artifacts.require("./test/DaricoICOTest.sol");
let TestDaricoGenesis = artifacts.require("./test/TestDaricoGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");
let DaricoICO = artifacts.require("./DaricoICO.sol");
let Utils = require("./utils");

let BigNumber = require('bignumber.js');
let drcPrecision = new BigNumber(1000000000000000000);
let precision = new BigNumber(1000000000000000000);
let team;
let drx, drc, ico, bounty;
var createdAt;
let emitTokensSince = parseInt(new Date().getTime() / 1000);

function createAllContracts(accounts) {
    "use strict";
    team = accounts[8];
    return Darico.new(
        0, // uint256 _initialSupply,
        new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
        18, // uint8 _precision,
        "Darico", // string _tokenName,
        "DRC" // string _symbol
    )
        .then((_result) => drc = _result)
        .then(() => {
            return TestDaricoGenesis.new(
                emitTokensSince,    // uint256 emitSince,
                true, // initGeneration
                0, // initialSupply
                drc.address, //drcAddress
            )
        })
        .then((_result) => drx = _result)
        .then(() => drx.name.call())
        .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))
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
        // deploying the ico smart contract
        .then(() => {
            let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
            let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 300);
            return TestICO.new(
                // bounty.address,// address _bounty,
                team, // address _team,
                drx.address, // address _drx,
                drc.address, // address _drc,
                _icoSince, // uint256 _icoSince,
                inFiveMinutes // uint256 _icoTill
            );
        })
        .then((_result) => ico = _result)
        .then(() => drx.addMinter(ico.address))
        .then(() => drc.addMinter(drx.address))
        .then(() => drc.addMinter(ico.address))
        // .then(() => drx.setDarico(drc.address))
        .then(() => drc.addMinter(bounty.address))
}

contract('DaricoGenesis Test Transfering', function (accounts) {


    it("DRX transfering", function () {
        return createAllContracts(accounts)

            .then(function () {
                return ico.sendTransaction({from: accounts[1], value: new BigNumber(50).mul(precision).valueOf()});
            })
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(5).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(5000).mul(precision).valueOf()))
            .then(function () {
                return drx.createdAt.call();
            })
            .then(function (result) {
                createdAt = parseInt(result.valueOf());
                console.log(createdAt);
                console.log(emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(5000).mul(precision).valueOf()))
            .then(function () {
                return drx.testClaim(createdAt + 15, {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log(result.valueOf()))
            .then(() => console.log(accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(5).valueOf()))
            // // 9.940068493 * 10 ** 18 +  new BigNumber(1000).mul(precision) =509940068493000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 5009940068493000000000))
            .then(() => drx.setBeneficiary(accounts[3],{from: accounts[1]}))
            .then(Utils.receiptShouldSucceed)
            // // .then(() => drx.getBeneficiary.call(accounts[1]))
            // // .then((result) => console.log('a3?',result.valueOf()))
            .then(() => console.log('a1',accounts[1]))
            .then(function () {
                return drx.testClaim(emitTokensSince + 35, {from: accounts[1]});
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 9940068493000000000))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 5009940068493000000000))
            .then(function() {
                return drx.testTransfer(emitTokensSince + 50, accounts[4], new BigNumber(2), {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[4], new BigNumber(2)))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[4], 0))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 5009940068493000000000))
            // (15/15 * 9940068493000000000 * 5)/5
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 19880136986000000000))
            .then(function () {
                return drx.testClaim(emitTokensSince + 65, {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // ((diff / emission.blockDuration) * emission.blockTokens * currentBalance) / totalSupply;
            // (65/15 * 9940068493000000000 * 3)/5
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], new BigNumber(25844178081800000000)))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[4], 0))
            .then(function () {
                return drx.testClaim(emitTokensSince + 65, {from: accounts[4]});
            })
            .then(Utils.receiptShouldSucceed)
            // (15/15 * 9940068493000000000 * 2)/5
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[4], new BigNumber('3976027397200000000').valueOf()))
            .then(function () {
                return drx.testClaim(emitTokensSince + 35, {from: accounts[4]});
            })
            .then(Utils.receiptShouldSucceed)
            // (65/15 * 9940068493000000000 * 3)/5
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], new BigNumber(25844178081800000000)))
            .then(function () {
                return drx.testClaim(emitTokensSince + 35, {from: accounts[4]});
            })
            .then(Utils.receiptShouldSucceed)
            // (65/15 * 9940068493000000000 * 2)/5
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[4], new BigNumber(3976027397200000000).valueOf()))

    });
});
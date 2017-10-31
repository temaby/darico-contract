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
    return DaricoGenesis.new(
        emitTokensSince,    // uint256 emitSince,
        true, // initGeneration
        0, // initialSupply
        0x0 // drcAddress
    )
        .then((_result) => drx = _result)
        .then(() => drx.name.call())
        .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

        .then(() => {
            return Darico.new(
                0, // uint256 _initialSupply,
                new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
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
        .then(() => drc.addMinter(ico.address))
        .then(() => drc.addMinter(bounty.address))


}

contract('DaricoGenesis', function (accounts) {
    it("create all contracts", function () {
        return createAllContracts(accounts)
            .then(() => drx.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))
            .then(() => drx.standard.call())
            .then((result) => assert.equal(result.valueOf(), "Darico Genesis 0.1", "standard is not equal"))
            .then(() => drx.symbol.call())
            .then((result) => assert.equal(result.valueOf(), "DRX", "token symbol is not equal"))
            .then(() => drx.decimals.call())
            .then((result) => assert.equal(result.valueOf(), 0, "precision is not equal"))
            .then(() => drx.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("0").valueOf(), "total supply is not equal"))
            .then(() => drx.locked.call())
            .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
            .then(() => drx.emitTokensSince.call())
            .then((result) => assert.equal(result.valueOf(), emitTokensSince, "emitTokensSince is not equal"))
            .then(() => Utils.balanceShouldEqualTo(drx, drx.address, new BigNumber("0").valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], 0))
            .then(() => Utils.getEmission(drx, 0))
            .then((emission) => Utils.checkEmission(emission, 15, "9940068493000000000", 1640995199, false))
            .then(() => Utils.getEmission(drx, 1))
            .then((emission) => Utils.checkEmission(emission, 15, "4970034247000000000", 1767225599, false))
            .then(() => Utils.getEmission(drx, 2))
            .then((emission) => Utils.checkEmission(emission, 15, "2485017123000000000", 1893455999, false))
            .then(() => Utils.getEmission(drx, 3))
            .then((emission) => Utils.checkEmission(emission, 15, "1242508562000000000", 2082758399, false))
            .then(function () {
                return drx.createdAt.call();
            })
            .then(function (result) {
                createdAt = parseInt(result.valueOf());
            })
    });


    it("DRX holder should be the default beneficiary of DRC", function () {
        //@TODO here we need to check that te claimable tokens are accrued on DRX holder's address
        return createAllContracts(accounts)
            .then(() => ico.sendTransaction({value: new BigNumber(10).mul(drcPrecision)}))
            // .then(()=> ico.sendTransaction({from:accounts[2], value: new BigNumber(100).mul(drcPrecision)}))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(1000).mul(drcPrecision).valueOf()))

    });
    it("DRX holder should be able to set the beneficiary", function () {
        var drx;
        var createdAt;
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
            .then(function () {
                return ico.sendTransaction({from: accounts[1], value: new BigNumber(10).mul(precision).valueOf()});
            })
            .then(()=>{
                createdAt = parseInt(new Date().getTime() / 1000);
                Utils.receiptShouldSucceed
            })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            // .then(function () {
            //     return drx.createdAt.call();
            // })
            .then(function () {

                console.log(createdAt);
                console.log(emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            var testPromise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve();
                }, 15000);
            });
            testPromise.then(function () {
                return drx.testClaim(parseInt(new Date().getTime() / 1000), {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log(result.valueOf()))
            .then(() => console.log(accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            // 9.940068493 * 10 ** 18 +  new BigNumber(1000).mul(precision) =1009940068493000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1009940068493000000000))
            .then(() => drx.setBeneficiary(accounts[3],{from: accounts[1]}))
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log('a3?',result.valueOf()))
            .then(() => console.log('a1',accounts[1]))
        var testPromise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve();
            }, 35000);
        });
        testPromise.then(function () {
                return drx.testClaim(parseInt(new Date().getTime() / 1000), {from: accounts[1]});
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 9940068493000000000))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1009940068493000000000))
    });
    it("NON DRX holder should  be able to set the beneficiary", function () {
        return createAllContracts(accounts)
            .then(() => drx.setBeneficiary(accounts[3]))
            .then(Utils.receiptShouldSucceed)
    });
    it("test Darico genesis token with claimable token", function () {
        var instance;
        var drx;
        var claimableToken;

        var createdAt;

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
            .then(function () {
                return ico.sendTransaction({from: accounts[1], value: new BigNumber(10).mul(precision).valueOf()});
            })
            .then(()=>{
                createdAt = parseInt(new Date().getTime() / 1000);
                Utils.receiptShouldSucceed
            })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))

            .then(function () {
                console.log(createdAt);
                console.log(emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            var testPromise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve();
                }, 15000);
            });
            testPromise.then(function () {
                return drx.testClaim(parseInt(new Date().getTime() / 1000), {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log(result.valueOf()))
            .then(() => console.log(accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            // 9.940068493 * 10 ** 18 +  new BigNumber(1000).mul(precision) =1009940068493000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1009940068493000000000))

    });

    it("if beneficiary is reset, all currently mined coins should be claimed and go to previous beneficiary", function () {
        var instance;
        var drx;
        var claimableToken;

        var createdAt;

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
            .then(function () {
                return ico.sendTransaction({from: accounts[1], value: new BigNumber(10).mul(precision).valueOf()});
            })
            .then(()=>{
                createdAt = parseInt(new Date().getTime() / 1000);
            Utils.receiptShouldSucceed
        })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))

            .then(function () {
                console.log('crea',createdAt);
                console.log('emit',emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            // .then(()=> Utils.timeout(15))
            .then(()=>{

            var now = parseInt(new Date().getTime() / 1000);
            console.log('now',now);
            })
            var testPromise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve();
                }, 15000);
            });
            testPromise.then(
                ()=>{
                console.log('after15',parseInt(new Date().getTime() / 1000));
                drx.setBeneficiary(accounts[3],{from: accounts[1]})
                }
            )
            .then(() => drx.setBeneficiary(accounts[2],{from: accounts[1]}))
            .then(() => drx.setBeneficiary(accounts[3],{from: accounts[1]}))
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1009940068493000000000))
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log('a3?',result.valueOf()))
            .then(() => console.log('a1',accounts[1]))
            .then(function () {
                return drx.testClaim(createdAt + 40, {from: accounts[1]});
            })
            // if here is an error  try to run test-file separetely (seems problem with time)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 9940068493000000000))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1009940068493000000000))
    });
});
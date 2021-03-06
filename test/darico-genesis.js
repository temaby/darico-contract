let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestICO = artifacts.require("./test/ICOTest.sol");
let TestDaricoGenesis = artifacts.require("./test/TestDaricoGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");
let ICO = artifacts.require("./ICO.sol");
let Utils = require("./utils");

let BigNumber = require('bignumber.js');
let drcPrecision = new BigNumber(1000000000000000000);
let precision = new BigNumber(1000000000000000000);
let team;
let drx, drc, ico, bounty;
var createdAt;
let emitTokensSince = parseInt(new Date().getTime() / 1000);
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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
            return ICO.new(
                accounts[7],// _etherHolder,
                drc.address, // _drc,
                drx.address, // _drx,
                accounts[6],// _team,
                _icoSince,// _startTime,
                inFiveMinutes, //_endTime,
                new BigNumber('57000000').mul(precision)
            )
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
        let drx, drc;
        let createdAt;
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
                return ICO.new(
                    accounts[7],// _etherHolder,
                    drc.address, // _drc,
                    drx.address, // _drx,
                    accounts[6],// _team,
                    _icoSince,// _startTime,
                    inFiveMinutes, //_endTime,
                    new BigNumber('57000000').mul(precision)
                )
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
                return drx.lastClaims.call(accounts[1]);
            })
            .then((result) => { createdAt = result.valueOf() })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            // .then(function () {
            //     return drx.createdAt.call();
            // })
            .then(function () {

                console.log('createdAt',createdAt);
                console.log('emitTokensSince',emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            .then(function () {
                console.log('createdAt+15',15 + parseInt(createdAt));
                return drx.testClaim(15 + parseInt(createdAt), {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log(result.valueOf()))
            .then(() => console.log(accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))

            //10k drx = (X) / 78k * 10k drc
            //   uint256 blocks = _duration.div(_blockDuration);
                // return 9.940068493 * 10 ** 18 *(1)/78000;
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1000000127436775551282))
            .then(() => drx.setBeneficiary(accounts[3],{from: accounts[1]}))
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log('a3?',result.valueOf()))
            .then(() => console.log('a1',accounts[1]))

        // 9.940068493 * 10 ** 18 +  new BigNumber(1000).mul(precision) =1009940068493000000000
        //10k drx = (X) / 78k * 10k drc
        //   uint256 blocks = _duration.div(_blockDuration);
        // return 9.940068493 * 1000000000000000000 *(1)/78000;
        .then(function () {
                return drx.testClaim(35 + parseInt(createdAt), {from: accounts[1]});
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 127436775551282))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1000000127436775551282))
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
                return ICO.new(
                    accounts[7],// _etherHolder,
                    drc.address, // _drc,
                    drx.address, // _drx,
                    accounts[6],// _team,
                    _icoSince,// _startTime,
                    inFiveMinutes, //_endTime,
                    new BigNumber('57000000').mul(precision)
                )
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
                return drx.lastClaims.call(accounts[1]);
            })
            .then((result) => { createdAt = result.valueOf() })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))

            .then(function () {
                console.log(createdAt);
                console.log(emitTokensSince);
            })
           .then(function () {
                return drx.testClaim(parseInt(createdAt)+15, {from: accounts[1]});
            })
            .then(Utils.receiptShouldSucceed)
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log(result.valueOf()))
            .then(() => console.log(accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            // 9.940068493 * 10 ** 18 +  new BigNumber(1000).mul(precision) =1009940068493000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1000000127436775551282))

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
                return ICO.new(
                    accounts[7],// _etherHolder,
                    drc.address, // _drc,
                    drx.address, // _drx,
                    accounts[6],// _team,
                    _icoSince,// _startTime,
                    inFiveMinutes, //_endTime,
                    new BigNumber('57000000').mul(precision)
                )
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
                return drx.lastClaims.call(accounts[1]);
            })
            .then((result) => { createdAt = result.valueOf() })
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[1], new BigNumber(1).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))

            .then(function () {
                console.log('crea',createdAt);
                console.log('emit',emitTokensSince);
            })
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(1000).mul(precision).valueOf()))
            .then(
                ()=>{
                console.log('after15',parseInt(new Date().getTime() / 1000));
                drx.testSetBeneficiary(parseInt(createdAt)+15, accounts[3],{from: accounts[1]})
                }
            )
            .then(() => drx.testSetBeneficiary(parseInt(createdAt)+15,accounts[2],{from: accounts[1]}))
            .then(() => drx.testSetBeneficiary(parseInt(createdAt)+15,accounts[3],{from: accounts[1]}))
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1000000127436775551282))
            // .then(() => drx.getBeneficiary.call(accounts[1]))
            // .then((result) => console.log('a3?',result.valueOf()))
            .then(() => console.log('a1',accounts[1]))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 0))
            .then(()=>{
                return drx.lastClaims.call(accounts[1]);
            })
            .then((result) => { createdAt = result.valueOf()})
            .then(function () {
                return drx.testClaim(parseInt(createdAt) + 15, {from: accounts[1]});
            })
            // if here is an error  try to run test-file separetely (seems problem with time)

            .then(() => Utils.balanceShouldEqualTo(drc, accounts[3], 127436775551282))

            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 1000000127436775551282))
    });

    it("check calculateEmissionTokensForNow", async function () {
        let claimableToken, createdAt, team;

        team = accounts[8];
       let drc = await Darico.new(
            0, // uint256 _initialSupply,
            new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        )
       let drx = await TestDaricoGenesis.new(
            parseInt(new Date().getTime() / 1000) - 32,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address, //drcAddress
        )
        await drx.mint(accounts[0], new BigNumber(10))
        await timeout(16000)
        .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], 10))
        .then(() => drx.name.call())
        .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

        .then(() => {return drx.calculateEmissionTokensForNow(accounts[0])})
        .then(() => {return drx.calculateEmissionTokensForNow.call(accounts[0])})
        .then((result) => {
           console.log('emitSince',parseInt(new Date().getTime() / 1000) - 32);
            //blocks.mul(_blockTokens).mul(_balance).div(maxSupply);
            //  1*9940068493000000000*10/78000= 1274367755512820.5128205128205128
           // 15*10/78000
            assert.equal(result.valueOf(), new BigNumber(1274367755512820).valueOf(), 'collected amount is not equal')
        })
    });

    it("check calculateEmissionTokensForNow block.timestamp < emitTokensSince", async function () {
        let claimableToken, createdAt, team;

        team = accounts[8];
        let drc = await Darico.new(
            0, // uint256 _initialSupply,
            new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        )
        let drx = await TestDaricoGenesis.new(
            parseInt(new Date().getTime() / 1000) + 32,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address, //drcAddress
        )
        await drx.mint(accounts[0], new BigNumber(10))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], 10))
            .then(() => drx.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

            .then(() => {return drx.calculateEmissionTokensForNow(accounts[0])})
            .then(() => {return drx.calculateEmissionTokensForNow.call(accounts[0])})
            .then((result) => {
                assert.equal(result.valueOf(), new BigNumber(0).valueOf(), 'collected amount is not equal')
            })
    });

    it("check calculateEmissionTokensForNow balanceOf(_address) == 0", async function () {
        let claimableToken, createdAt, team;

        team = accounts[8];
        let drc = await Darico.new(
            0, // uint256 _initialSupply,
            new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        )
        let drx = await TestDaricoGenesis.new(
            parseInt(new Date().getTime() / 1000) + 32,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address, //drcAddress
        )
            await Utils.balanceShouldEqualTo(drx, accounts[0], 0)
            .then(() => drx.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

            .then(() => {return drx.calculateEmissionTokensForNow(accounts[0])})
            .then(() => {return drx.calculateEmissionTokensForNow.call(accounts[0])})
            .then((result) => {
                assert.equal(result.valueOf(), new BigNumber(0).valueOf(), 'collected amount is not equal')
            })
    });
    it("check calculateEmissionTokensForNow lastClaimAt >= block.timestamp", async function () {
        let claimableToken, createdAt, team;

        team = accounts[8];
        let drc = await Darico.new(
            0, // uint256 _initialSupply,
            new BigNumber(78000000).mul(drcPrecision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        )
        let drx = await TestDaricoGenesis.new(
            parseInt(new Date().getTime() / 1000) - 32,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address, //drcAddress
        )
        await drx.mint(accounts[0], new BigNumber(10))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], 10))
            .then(() => drx.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Genesis"))

            .then(() => {return drx.calculateEmissionTokensForNow(accounts[0])})
            .then(() => {return drx.calculateEmissionTokensForNow.call(accounts[0])})
            .then((result) => {
                assert.equal(result.valueOf(), new BigNumber(0).valueOf(), 'collected amount is not equal')
            })
    });
});
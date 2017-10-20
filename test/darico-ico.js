let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestICO = artifacts.require("./test/DaricoICOTest.sol");
let Darico = artifacts.require("./Darico.sol");
let DaricoICO = artifacts.require("./DaricoICO.sol");
let Utils = require("./utils");

let BigNumber = require('bignumber.js');
let drcPrecision = new BigNumber(1000000000000000000);
let decimals = new BigNumber(1000000000000000000);

contract('DaricoICO', function (accounts) {

    it("create contracts & check emission info", function() {
        let team = accounts[5];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        return DaricoGenesis.new(
            emitTokensSince,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            0x0 // drcAddress
        )
            .then((_result) => drx = _result)
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
            .then(() => {
                return Darico.new(
                    0, // uint256 _initialSupply,
                    780000, // uint256 _maxSupply,
                    18, // uint8 _precision,
                    "Darico", // string _tokenName,
                    "DRC" // string _symbol
                );
            })
            .then((_result) => drc = _result)
            .then(() => drc.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico"))
            .then(() => drc.standard.call())
            .then((result) => assert.equal(result.valueOf(), "Darico Standard 0.1", "standard is not equal"))
            .then(() => drc.symbol.call())
            .then((result) => assert.equal(result.valueOf(), "DRC", "token symbol is not equal"))
            .then(() => drc.decimals.call())
            .then((result) => assert.equal(result.valueOf(), 18, "precision is not equal"))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("0").valueOf(), "total supply is not equal"))
            .then(() => drc.locked.call())
            .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
            .then(() => Utils.balanceShouldEqualTo(drc, drc.address, new BigNumber("0").valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], 0))

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
            .then(() => bounty.name.call())
            .then((_result) => assert.equal(_result.valueOf(), "Darico Bounty"))
            .then(() => bounty.standard.call())
            .then((result) => assert.equal(result.valueOf(), "DaricoBounty 0.1", "standard is not equal"))
            .then(() => bounty.symbol.call())
            .then((result) => assert.equal(result.valueOf(), "DARB", "token symbol is not equal"))
            .then(() => bounty.decimals.call())
            .then((result) => assert.equal(result.valueOf(), 18, "precision is not equal"))
            .then(() => bounty.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("0").valueOf(), "total supply is not equal"))
            .then(() => bounty.locked.call())
            .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
            .then(() => Utils.balanceShouldEqualTo(bounty, bounty.address, new BigNumber("0").valueOf()))
            .then(() => Utils.balanceShouldEqualTo(bounty, accounts[0], 0))


            // @TODO I mints some more DRC


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
            .then(() => ico.team.call())
            .then((result) => assert.equal(result.valueOf(), accounts[5], "team symbol is not equal"))
            .then(() => ico.drx.call())
            .then((result) => assert.equal(result.valueOf(), drx.address, "drx is not equal"))
            .then(() => ico.drc.call())
            .then((result) => assert.equal(result.valueOf(), drc.address, "drc is not equal"))

    });
    it("create all contracts", function () {
        let team = accounts[0];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

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
                    // drx.address, // address _genesisToken,
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

            // @TODO I mints some more DRC


            // deploying the ico smart contract
            .then(() => {
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 300);
                return TestICO.new(
                    // bounty.address,// address _bounty,
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
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldSucceed)
            // first phase price  100
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], new BigNumber(100).mul(drcPrecision).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber(100).mul(drcPrecision).valueOf(), "total supply is not equal"))
            .then(() => drx.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("0").valueOf(), "total supply is not equal"))

            .then(function () {
                return ico.buy({from: accounts[2], value: new BigNumber(10).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[2], new BigNumber(1000).mul(drcPrecision).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber(1100).mul(drcPrecision).valueOf(), "total supply is not equal"))
            .then(() => drx.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("1").valueOf(), "total supply is not equal"))
    })
    it('checks  the  prices  for different periods', function () {
        let team = accounts[0];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

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
        .then(() => ico.testCalculateDRCAmountForEth.call(new BigNumber(1).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(100).mul(drcPrecision).valueOf(), "amount is not equal"))
        .then(() => ico.testCalculateDRCAmountForEth.call(new BigNumber(100).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(10000).mul(drcPrecision).valueOf(), "amount is not equal"))
        .then(() => ico.testCalculateDRCAmountForEth.call(new BigNumber(50002).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber('5.00017000000000000000255e+24').valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(50000.00).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
            //10^36/11764705882352941
        .then((result) => assert.equal(result.valueOf(), new BigNumber('85000000000000001275').valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(117647.06).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
        //10^36/14285714285714285
        .then((result) => assert.equal(result.valueOf(), new BigNumber('70000000000000003500').valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(142857.14).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
        //10^36/18181818181818181
        .then((result) => assert.equal(result.valueOf(), new BigNumber('55000000000000002475').valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(181818.18).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(40).mul(decimals).valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(250000.00).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(25).mul(decimals).valueOf(), "amount is not equal"))

        .then(() => ico.testDRCAmount.call(new BigNumber(400000.00).mul(decimals).valueOf(),new BigNumber(1).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(10).mul(decimals).valueOf(), "amount is not equal"))

        then(() => ico.testDRCAmount.call(new BigNumber(500000.00).mul(decimals).valueOf(),new BigNumber(1000001).mul(drcPrecision).valueOf()))
        .then((result) => assert.equal(result.valueOf(), new BigNumber(25000010).mul(decimals).valueOf(), "amount is not equal"))
    });

    it("create contracts is  shouldn't be able to buy beyond ICO", function () {
        let team = accounts[0];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

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
                    // drx.address, // address _genesisToken,
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

            // @TODO I mints some more DRC


            // deploying the ico smart contract
            .then(() => {
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 - 100);
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
            .then(()=>drx.addMinter(ico.address))
            .then(()=>drc.addMinter(ico.address))

            // .then(Utils.receiptShouldSucceed)
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            // first phase price  100
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[1], 0))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), 0, "total supply is not equal"))
            .then(() => drx.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber("0").valueOf(), "total supply is not equal"))

            .then(function () {
                return ico.sendTransaction({value: new BigNumber(10).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(()=>{
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 100);
                return ico.changeICOPeriod(_icoSince, inFiveMinutes)})
            .then(Utils.receiptShouldSucceed)
            .then(()=> ico.sendTransaction({value: new BigNumber(10).mul(drcPrecision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(1000).mul(drcPrecision)))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber(1).valueOf()))

            .then(()=>{
                let _icoSince = parseInt(new Date().getTime() / 1000 +200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 1000);
                return ico.changeICOPeriod(_icoSince, inFiveMinutes)})
            .then(Utils.receiptShouldSucceed)
            .then(()=> ico.sendTransaction({value: new BigNumber(10).mul(drcPrecision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(1000).mul(drcPrecision)))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber(1).valueOf()))
    })

    it("create contracts it  shouldn't be able to buy when ICO is finished", function () {
        let team = accounts[8];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

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
                    // drx.address, // address _genesisToken,
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

            // @TODO I mints some more DRC


            // deploying the ico smart contract
            .then(() => {
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 100);
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
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[8], new BigNumber(0).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[8], new BigNumber(0).valueOf()))
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldSucceed)
            .then(()=>{
                let since = parseInt(new Date().getTime() / 1000 -1200);
                let till = parseInt(new Date().getTime() / 1000 - 1000);
                return ico.changeICOPeriod(since, till)})
            .then(()=>ico.finishICO())
            .then(Utils.receiptShouldSucceed)
            //1*100000000000000000000 *3/10
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[8], new BigNumber('30000000000000000000').valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[8], new BigNumber(0).valueOf()))
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
    })

    it("create contracts owner should be able to pause and resume ICO", function () {
        let team = accounts[8];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

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
                    // drx.address, // address _genesisToken,
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

            // @TODO I mints some more DRC


            // deploying the ico smart contract
            .then(() => {
                let _icoSince = parseInt(new Date().getTime() / 1000 - 200);
                let inFiveMinutes = parseInt(new Date().getTime() / 1000 + 100);
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
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[8], new BigNumber(0).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[8], new BigNumber(0).valueOf()))
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldSucceed)
            .then(()=>ico.pauseICO())
            .then(Utils.receiptShouldSucceed)
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(()=>ico.resumeICO())
            .then(Utils.receiptShouldSucceed)
            .then(function () {
                return ico.buy({from: accounts[1], value: new BigNumber(1).mul(drcPrecision)});
            })
            .then(Utils.receiptShouldSucceed)
    })

});
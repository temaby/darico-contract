var PreICO = artifacts.require("./PreICO.sol");
var Darico = artifacts.require("./Darico.sol");
var DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
var TestPreICO = artifacts.require("./test/PreICOTest.sol");
var ICO = artifacts.require("./ICO.sol");

var Utils = require("./utils");

var BigNumber = require('bignumber.js');
var precision = new BigNumber("1000000000000000000");
var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
var icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract('DaricoPreICO', function (accounts) {
    let drc, drx;

    beforeEach(async function () {
        drc = await Darico.new(
            0, // uint256 _initialSupply,
            // drx.address, // address _genesisToken,
            new BigNumber(240000000).mul(precision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        );
        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        drx = await DaricoGenesis.new(
            emitTokensSince,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address
        )
    });

    it("create contracts & check token info", async function () {
        console.log(drc.address)
        console.log(drx.address)
        let preICO = await PreICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(3000000).mul(precision)
        )
        await  drc.standard.call()
            .then((result) => assert.equal(result.valueOf(), "Darico Standard 0.1", "standard is not equal"))
            .then(() => drc.name.call())
            .then((result) => assert.equal(result.valueOf(), "Darico", "token name is not equal"))
            .then(() => drc.symbol.call())
            .then((result) => assert.equal(result.valueOf(), "DRC", "token symbol is not equal"))
            .then(() => drc.decimals.call())
            .then((result) => assert.equal(result.valueOf(), 18, "precision is not equal"))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), 0, "total supply is not equal"))
            .then(() => drc.maxSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber(240000000).mul(precision).valueOf(), "maxSupply is not equal"))
            .then(() => drc.locked.call())
            .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
            .then(() => preICO.drc.call())
            .then((result) => assert.equal(result.valueOf(), drc.address, "Darico is not equal"))
            .then(() => preICO.startTime.call())
            .then((result) => assert.equal(result.valueOf(), icoSince, "startTime is not equal"))
            .then(() => preICO.endTime.call())
            .then((result) => assert.equal(result.valueOf(), icoTill, "startTime is not equal"))
            .then(() => preICO.maxTokenSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('3000000').mul(precision), "maxTokenSupply is not equal"))

            .then(() => Utils.balanceShouldEqualTo(drc, drc.address, new BigNumber("0")))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber("0").valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, drx.address, new BigNumber("0")))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber("0").valueOf()))
    });

    it("create contract & buy tokens ico & check ethers & transfer ethers", async function () {

        var ownerEthBalance = 0;
        var contractEthBalance = 0;

        let preICO = await PreICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(3000000).mul(precision)
        )

        await drc.addMinter(preICO.address)
        await drx.addMinter(preICO.address)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber("0").valueOf()))
            .then(() => preICO.sendTransaction({value:new BigNumber('9.1').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => {
                contractEthBalance = Utils.getEtherBalance(preICO.address);
            })
            .then(() => {
                ownerEthBalance = Utils.getEtherBalance(accounts[7]);
            })

            // 10*10^18*10^18/10000000000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber('1000000000000000000000').valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('1000000000000000000000').valueOf(), 'collected amount is not equal'))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber('1').valueOf()))
            .then(() => preICO.transferEthers())
            .then((result) => {
                Utils.receiptShouldSucceed(result);
                return Utils.getTxCost(result);
            })
            .then((taxCost) => {
                Utils.checkEtherBalance(accounts[7], parseFloat(ownerEthBalance) + parseFloat(contractEthBalance));
            })
            .then(() => {
                Utils.checkEtherBalance(preICO.address, 0);
            })
    });

    it("create contract & try to buy  not multiple  1000 DRC", async function () {

        var ownerEthBalance = 0;
        var contractEthBalance = 0;

        let preICO = await PreICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(3000000).mul(precision)
        )

        await drc.addMinter(preICO.address)
        await drx.addMinter(preICO.address)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber("0").valueOf()))
            .then(() => preICO.sendTransaction({value:new BigNumber('12').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
    });
    it('create contract, finish pre', async function () {
        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let preICO = await TestPreICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(3000000).mul(precision)
        )
        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(57000000).mul(precision)
        )

        await drc.addMinter(preICO.address)
        await drx.addMinter(preICO.address)
            .then(() => preICO.sendTransaction({value:new BigNumber('9.1').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => {
                contractEthBalance = Utils.getEtherBalance(preICO.address);
            })
            .then(() => {
                ownerEthBalance = Utils.getEtherBalance(accounts[7])
            })
            // 10*10^18*10^18/10000000000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber('1000000000000000000000').valueOf()))
            await preICO.changeDatesTest(icoSince, parseInt(new Date().getTime() / 1000) - 600);
            await preICO.setICO(ico.address);
            await preICO.transferPreICOUnsoldTokens()
           .then(() => ico.maxTokenSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('59999000').mul(precision).valueOf(), "maxTokenSupply is not equal"))
    });
    it('create contract, sendTokensToApplicature', async function () {
        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let preICO = await TestPreICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber(3000000).mul(precision)
        )
        await drc.addMinter(preICO.address)
        await drx.addMinter(preICO.address)
        await preICO.sendTokensToApplicature();

    });
})
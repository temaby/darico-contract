var ICO = artifacts.require("./ICO.sol");
var Darico = artifacts.require("./Darico.sol");
var DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
var ICOTest = artifacts.require("./test/ICOTest.sol");

var Utils = require("./utils");

var BigNumber = require('bignumber.js');
var precision = new BigNumber("1000000000000000000");
var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
var icoTill = parseInt(new Date().getTime() / 1000) + 3600;

contract('DaricICO', function (accounts) {
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
         let ico = await ICO.new(
             accounts[7],// _etherHolder,
             drc.address, // _drc,
             drx.address, // _drx,
             accounts[6],// _team,
             icoSince,// _startTime,
             icoTill, //_endTime,
             new BigNumber(57000001).mul(precision)
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
     .then(() => ico.drc.call())
     .then((result) => assert.equal(result.valueOf(), drc.address, "Darico is not equal"))
     .then(() => ico.startTime.call())
     .then((result) => assert.equal(result.valueOf(), icoSince, "startTime is not equal"))
     .then(() => ico.endTime.call())
     .then((result) => assert.equal(result.valueOf(), icoTill, "startTime is not equal"))
     .then(() => ico.maxTokenSupply.call())
     .then((result) => assert.equal(result.valueOf(), new BigNumber('57000001').mul(precision), "maxTokenSupply is not equal"))

     .then(() => Utils.balanceShouldEqualTo(drc, drc.address, new BigNumber("0")))
     .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber("0").valueOf()))
     .then(() => Utils.balanceShouldEqualTo(drx, drx.address, new BigNumber("0")))
     .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber("0").valueOf()))
     });

    it("create contract & buy tokens ico & check ethers & transfer ethers", async function () {

        var ownerEthBalance = 0;
        var contractEthBalance = 0;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber("0").valueOf()))
            .then(() => ico.sendTransaction({value:new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => {
                contractEthBalance = Utils.getEtherBalance(ico.address);
            })
            .then(() => {
                ownerEthBalance = Utils.getEtherBalance(accounts[7]);
            })

            // 10*10^18*10^18/10000000000000000
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber('1000000000000000000000').valueOf()))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('1000000000000000000000').valueOf(), 'collected amount is not equal'))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[0], new BigNumber('1').valueOf()))
            .then(() => ico.transferEthers())
            .then((result) => {
                Utils.receiptShouldSucceed(result);
                return Utils.getTxCost(result);
            })
            .then((taxCost) => {
                Utils.checkEtherBalance(accounts[7], parseFloat(ownerEthBalance) + parseFloat(contractEthBalance));
            })
            .then(() => {
                Utils.checkEtherBalance(ico.address, 0);
            })
    });

    it("it should fail when buy tokens before ICO", async function () {

        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) - 3;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => ico.sendTransaction({value: new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], 0))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('0').valueOf(), 'collected amount is not equal'))
    });

    it("it should fail when buy tokens after ICO", async function () {

        var icoSince = parseInt(new Date().getTime() / 1000 + 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => ico.sendTransaction({value: new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], 0))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('0').valueOf(), 'collected amount is not equal'))
    });

    it("it should fail when tries to contribute zero eth", async function () {

        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => ico.sendTransaction({value: new BigNumber('0').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], 0))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('0').valueOf(), 'collected amount is not equal'))
    });

    it("it should fail when tries to contribute less  then min", async function () {

        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => ico.sendTransaction({value: new BigNumber('9').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], 0))
            .then(() => drc.totalSupply.call())
            .then((result) => assert.equal(result.valueOf(), new BigNumber('0').valueOf(), 'collected amount is not equal'))
    });

    it("check tiers", async function () {

    var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
    var icoTill = parseInt(new Date().getTime() / 1000) + 3* 3600;
    let ico = await ICO.new(
        accounts[7],// _etherHolder,
        drc.address, // _drc,
        drx.address, // _drx,
        accounts[6],// _team,
        icoSince,// _startTime,
        icoTill, //_endTime,
        new BigNumber('57000001').mul(precision)
    )

    await drc.addMinter(ico.address)
    await drx.addMinter(ico.address)
     amount = await ico.getTokensAmount.call(new BigNumber(10).mul(precision),  0)
    //   uint256 amount = 10*10^18*10^18/10000000000000000 = 1000000000000000000000;
       assert.equal(amount.valueOf(), new BigNumber("1000000000000000000000").valueOf(), "value is not equal")

        amount = await ico.getTokensAmount.call(new BigNumber(11.1).mul(precision),   new BigNumber(22000000).mul(precision))
        //   uint256 amount = 11.1*10^18*10^18/11100000000000000 = 999000000000000009990;
        assert.equal(amount.valueOf(), new BigNumber("1000000000000000000000").valueOf(), "value is not equal")

        amount = await ico.getTokensAmount.call(new BigNumber(13.4).mul(precision),   new BigNumber(47000000).mul(precision))
        //   uint256 amount = 13.4*10^18*10^18/13333333333333333 = 1005000000000000025125;
        .then((result) => assert.equal(result.valueOf(), new BigNumber('1000').mul(precision).valueOf(), "value is not equal"))

        .then(() => ico.getTokensAmount.call(new BigNumber(20).mul(precision),   new BigNumber(57000000).mul(precision)))
        // over max limit
        .then((result) => assert.equal(result.valueOf(), new BigNumber('0').valueOf(), "value is not equal"))
    });

    it('create contract, should not be able to buy more than  max ICO supply ', async function () {
        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICOTest.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000000').mul(precision),
            new BigNumber('56999000').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))

            .then(() => ico.sendTransaction({value:new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => drc.totalSupply.call())
            .then((result) => {
                //   uint256 amount = 13.4*10^18*10^18/13333333333333333 = 1005000000000000025125;
                assert.equal(result.valueOf(), new BigNumber('1000').mul(precision).valueOf(), 'collected amount is not equal')
            })
            .then(() => ico.sendTransaction({value:new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => drc.totalSupply.call())
            .then((result) => {
                assert.equal(result.valueOf(), new BigNumber('0').valueOf(), 'collected amount is not equal')
            })
    });

    it('create contract, set drc address, drx address', async function () {
        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICO.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000001').mul(precision)
        )
        let drc1 = await Darico.new(
            0, // uint256 _initialSupply,
            // drx.address, // address _genesisToken,
            new BigNumber(240000000).mul(precision), // uint256 _maxSupply,
            18, // uint8 _precision,
            "Darico", // string _tokenName,
            "DRC" // string _symbol
        );
        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        let drx1 = await DaricoGenesis.new(
            emitTokensSince,    // uint256 emitSince,
            true, // initGeneration
            0, // initialSupply
            drc.address
        )
        await ico.setDarico(drc1.address)
        await ico.setDaricoGenesis(drx1.address)
        await drc1.addMinter(ico.address)
        await drx1.addMinter(ico.address)
            .then(() => ico.sendTransaction({value:new BigNumber('10').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            // 10*10^18*10^18/10000000000000000
            .then(() => Utils.balanceShouldEqualTo(drc1, accounts[0], new BigNumber('1000000000000000000000').valueOf()))
    });

    it('create contract, set etherHolder address', async function () {
               var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
               var icoTill = parseInt(new Date().getTime() / 1000) + 3* 3600;

               let ico = await ICO.new(
                   accounts[7],// _etherHolder,
                   drc.address, // _drc,
                   drx.address, // _drx,
                   accounts[6],// _team,
                   icoSince,// _startTime,
                   icoTill, //_endTime,
                   new BigNumber('57000001').mul(precision)
               )

               await drc.addMinter(ico.address)
               await drx.addMinter(ico.address)
               await ico.etherHolder.call()
                   .then((result) => assert.equal(result.valueOf(), accounts[7], "EtherHolder is not equal"))
                   .then(() => ico.sendTransaction({value:new BigNumber('10').mul(precision)}))
                   .then(Utils.receiptShouldSucceed)
                   .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber('1000000000000000000000').valueOf()))
               await ico.setEtherHolder(accounts[3]);
               await  ico.etherHolder.call()
                   .then((result) => assert.equal(result.valueOf(), accounts[3], "EtherHolder is not equal"))
           });

    it('create contract, finish ICO', async function () {
        var icoSince = parseInt(new Date().getTime() / 1000 - 3600);
        var icoTill = parseInt(new Date().getTime() / 1000) + 3 * 3600;

        let ico = await ICOTest.new(
            accounts[7],// _etherHolder,
            drc.address, // _drc,
            drx.address, // _drx,
            accounts[6],// _team,
            icoSince,// _startTime,
            icoTill, //_endTime,
            new BigNumber('57000000').mul(precision),
            new BigNumber('56999000').mul(precision)
        )

        await drc.addMinter(ico.address)
        await drx.addMinter(ico.address)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[0], new BigNumber(0).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[6], new BigNumber("0").valueOf()))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[6], new BigNumber("0")))
            .then(() => ico.sendTransaction({value:new BigNumber('13.4').mul(precision)}))
            .then(Utils.receiptShouldSucceed)
            .then(() => ico.team.call())
            .then((result) => assert.equal(result.valueOf(), accounts[6], "team is not equal"))
            .then(() => Utils.balanceShouldEqualTo(drx, accounts[6], new BigNumber("0")))
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[6], new BigNumber("17100000000000000000000000").valueOf()))
    });
});
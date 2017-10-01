let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let TestGenesis = artifacts.require("./test/TestGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");


let Utils = require("../libs/test/utils");

let BigNumber = require('../libs/node_modules/bignumber.js');

let precision = new BigNumber("1000000000000000000");

/*
contract('DaricoGenesis', function(accounts) {
    "use strict";

    // we create Bounty contract first

    it("create contract & check emission info", function() {
        let genesis, darico;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        return DaricoGenesis.new(
                emitTokensSince, true,
            78000000)
        .then(function(_instance) {
            genesis = _instance;
        })
        .then(() => genesis.standard.call())
        .then((result) => assert.equal(result.valueOf(), "Darico Genesis 0.1", "standard is not equal"))
        .then(() => genesis.name.call())
        .then((result) => assert.equal(result.valueOf(), "Darico Genesis", "token name is not equal"))
        .then(() => genesis.symbol.call())
        .then((result) => assert.equal(result.valueOf(), "DRX", "token symbol is not equal"))
        .then(() => genesis.decimals.call())
        .then((result) => assert.equal(result.valueOf(), 0, "precision is not equal"))
        .then(() => genesis.totalSupply.call())
        .then((result) => assert.equal(result.valueOf(), new BigNumber("78000000").valueOf(), "total supply is not equal"))
        .then(() => genesis.locked.call())
        .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
        .then(() => genesis.emitTokensSince.call())
        .then((result) => assert.equal(result.valueOf(), emitTokensSince, "emitTokensSince is not equal"))
        .then(() => Utils.balanceShouldEqualTo(genesis, genesis.address, 0))
        .then(() => Utils.balanceShouldEqualTo(genesis, accounts[0], 78000000))
        .then(() => Utils.getEmission(genesis, 0))
        .then((emission) => Utils.checkEmission(emission, 15, "9940068493000000000", 1640995199, false))
        .then(() => Utils.getEmission(genesis, 1))
        .then((emission) => Utils.checkEmission(emission, 15, "4970034247000000000", 1767225599, false))
        .then(() => Utils.getEmission(genesis, 2))
        .then((emission) => Utils.checkEmission(emission, 15, "2485017123000000000", 1893455999, false))
        .then(() => Utils.getEmission(genesis, 3))
        .then((emission) => Utils.checkEmission(emission, 15, "1242508562000000000", 2082758399, false))
        .then(() => genesis.claimableToken.call())
        .then((result) => assert.equal(result.valueOf(), "0x0000000000000000000000000000000000000000", "darico token is not equal"))
            .then(function () {
                return Darico.new(
                    new BigNumber(78000000).mul(precision),
                    genesis.address,
                    new BigNumber(78000000).mul(precision),
                    18,
                    "Darico",
                    "DCO"
                )
            })
        .then(function(_instance) {
            darico = _instance;
        })
        .then(() => darico.standard.call())
        .then((result) => assert.equal(result.valueOf(), "Darico Standard 0.1", "standard is not equal"))
        .then(() => darico.name.call())
        .then((result) => assert.equal(result.valueOf(), "Darico", "token name is not equal"))
        .then(() => darico.symbol.call())
        .then((result) => assert.equal(result.valueOf(), "DCO", "token symbol is not equal"))
        .then(() => darico.decimals.call())
        .then((result) => assert.equal(result.valueOf(), 18, "precision is not equal"))
        .then(() => darico.totalSupply.call())
        .then((result) => assert.equal(result.valueOf(), new BigNumber("78000000").mul(precision).valueOf(), "total supply is not equal"))
        .then(() => darico.locked.call())
        .then((result) => assert.equal(result.valueOf(), false, "locked is not equal"))
        .then(() => Utils.balanceShouldEqualTo(darico, genesis.address, 0))
        .then(() => Utils.balanceShouldEqualTo(darico, accounts[0], new BigNumber("78000000").mul(precision).valueOf()))
        .then(() => darico.genesisToken.call())
        .then((result) => assert.equal(result.valueOf(), genesis.address, "genesis token is not equal"))

        .then(function () {
            return genesis.setClaimableToken(darico.address);
        })
        .then(Utils.receiptShouldSucceed)
        .then(() => genesis.claimableToken.call())
        .then((result) => assert.equal(result.valueOf(), darico.address, "darico token is not equal"))
    });


    it("check token amount calculations", function() {
        let instance;

        let totalSupply = 720000;

        let emitTokensSince = 1514764800;

        let firstPeriodEnds = 1640995200;
        let secondPeriodEnds = 1767225600;
        let thirdPeriodEnds = 1893456000;
        let forthPeriodEnds = 2082758400;

        return DaricoGenesis.new(
                emitTokensSince, false, 0
            )
        .then(function(_instance) {
            instance = _instance;
        })
        .then(function() {
            return instance.addTokenEmission(15, new BigNumber("9.940068493").mul(precision), firstPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)

        .then(function() {
            return instance.addTokenEmission(15, new BigNumber("4.970034247").mul(precision), secondPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
        .then(function() {
            return instance.addTokenEmission(15, new BigNumber("2.485017123").mul(precision), thirdPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
        .then(function() {
            return instance.addTokenEmission(15, new BigNumber("1.242508562").mul(precision), forthPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
        // 3600 / 15 = 240 blocks
        // total generated tokens for 240 blocks = 2,385.61643832 * 10^18
        // user part of total supply = 0.0001388888889
        // total generated tokens for user = 2,385.61643832 * 10^18 * 0.0001388888889 = 3.313356165E17
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 0, 3600, 100, totalSupply, "331335616433333333"))
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 0, 3600, 0, totalSupply, "0"))
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 3600, 3600, 100, totalSupply, "0"))
        // test for 100 days
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 8640000, 8640000 * 2, 100, totalSupply, "795205479440000000000"))
        // test for 100 days if genesis balance = 0
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 8640000, 8640000 * 2, 0, totalSupply, "0"))
        // test for calculations between two periods, 100 days in first period, 100 in second period, 99 tokens
        // blocks in 1 period: 576,000
        // blocks in 2 period: 437,760
        // emitted for 1 period: 787.2534246456
        // emitted for 2 period: 302.1780822176
        .then(() => Utils.checkClaimedTokensAmount(instance, firstPeriodEnds - 86400 * 100, 0, 86400 * 176, 99, totalSupply, "1.086409726041024e+21"))
        // actual total tokens for 1 period:   8.3649244853183987e+25
        // expected total tokens for 1 period: 8.3592E25
        // actual total tokens for 2 period:   4.182462740083392e+25
        // expected total tokens for 2 period: 4.1796E25
        // actual total tokens for 3 period:   2.091231369620928e+25
        // expected total tokens for 3 period: 2.0898E25
        // actual total tokens for 4 period:   1.568065685380992e+25
        // expected total tokens for 4 period: 1.56735E25
        .then(() => Utils.checkClaimedTokensAmount(instance, emitTokensSince, 0, forthPeriodEnds - emitTokensSince, 720000, totalSupply, "1.620668527441056e+26"))
    });

    it("test genesis token with claimable token", function() {
        let genesisToken;
        let claimableToken;

        let createdAt;

        let emitTokensSince = 1514764800;

        let firstPeriodEnds = 1640995200;
        let secondPeriodEnds = 1767225600;
        let thirdPeriodEnds = 1893456000;
        let forthPeriodEnds = 2082758400;

        return DaricoGenesis.new(
            emitTokensSince, false,
            78000000
        )
        .then(function(_instance) {
            genesisToken = _instance;

            return genesisToken.createdAt.call();
        })
        .then(function(result) {
            createdAt = parseInt(result.valueOf());
        })
        .then(function() {
            return Darico.new(genesisToken.address, new BigNumber(78000000).mul(precision), 18, "Darico", "DCO");
        })
        .then(function(_instance) {
            claimableToken = _instance;

            return genesisToken.setClaimableToken(claimableToken.address);
        })
        .then(Utils.receiptShouldSucceed)
        .then(function() {
            console.log(genesisToken.address);
        })
        .then(function() {
            return genesisToken.transfer(accounts[1], new BigNumber(1000));
        })
        .then(Utils.receiptShouldSucceed)
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(1000).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], new BigNumber(0).valueOf()))
        .then(function() {
            return genesisToken.addTokenEmission(15, new BigNumber("9.940068493").mul(precision), firstPeriodEnds);
        })
       .then(Utils.receiptShouldSucceed)

        .then(function() {
            return genesisToken.addTokenEmission(15, new BigNumber("4.970034247").mul(precision), secondPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
          .then(function() {
            return genesisToken.addTokenEmission(15, new BigNumber("2.485017123").mul(precision), thirdPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
        .then(function() {
            return genesisToken.addTokenEmission(15, new BigNumber("1.242508562").mul(precision), forthPeriodEnds);
        })
        .then(Utils.receiptShouldSucceed)
        .then(function() {
            return genesisToken.testClaim(emitTokensSince + 3600, {from: accounts[1]});
        })
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(1000).valueOf()))
        // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "30584826132307692"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "0"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))


        .then(function() {
            return genesisToken.testTransfer(emitTokensSince + 7200, accounts[2], new BigNumber(500), {from: accounts[1]});
        })
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(500).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "0"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
        .then(function() {
            return genesisToken.testTransfer(emitTokensSince + 10800, accounts[3], new BigNumber(150), {from: accounts[2]});
        })
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(350).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(150).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "15292413066153846"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
        .then(function() {
            return genesisToken.testTransfer(emitTokensSince + 14400, accounts[4], new BigNumber(43), {from: accounts[3]});
        })
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(350).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(107).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[4], new BigNumber(43).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "15292413066153846"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "4587723919846153"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
        .then(function() {
            return genesisToken.testTransfer(emitTokensSince + 18000, accounts[2], new BigNumber(18), {from: accounts[4]});
        })
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(368).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(107).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[4], new BigNumber(25).valueOf()))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "36701791358769230"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "4587723919846153"))
        .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "1315147523689230"));

    });


    it("genesis+daughter token with delegated claim", function() {
        let genesisToken;
        let claimableToken;

        let createdAt;

        let emitTokensSince = 1514764800;

        let firstPeriodEnds = 1640995200;
        let secondPeriodEnds = 1767225600;
        let thirdPeriodEnds = 1893456000;
        let forthPeriodEnds = 2082758400;

        return TestGenesis.new(
            emitTokensSince, false,
            78000000
        )
            .then(function(_instance) {
                genesisToken = _instance;

                return genesisToken.createdAt.call();
            })
            .then(function(result) {
                createdAt = parseInt(result.valueOf());
            })
            .then(function() {
                return Darico.new(genesisToken.address, new BigNumber(78000000).mul(precision), 18, "Darico", "DCO");
            })
            .then(function(_instance) {
                claimableToken = _instance;

                return genesisToken.setClaimableToken(claimableToken.address);
            })
            .then(Utils.receiptShouldSucceed)
            .then(function() {
                return genesisToken.transfer(accounts[1], new BigNumber(1000));
            })
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(1000).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], new BigNumber(0).valueOf()))
            .then(function() {
                return genesisToken.addTokenEmission(15, new BigNumber("9.940068493").mul(precision), firstPeriodEnds);
            })
            .then(Utils.receiptShouldSucceed)

            .then(function() {
                return genesisToken.addTokenEmission(15, new BigNumber("4.970034247").mul(precision), secondPeriodEnds);
            })
            .then(Utils.receiptShouldSucceed)
            .then(function() {
                return genesisToken.addTokenEmission(15, new BigNumber("2.485017123").mul(precision), thirdPeriodEnds);
            })
            .then(Utils.receiptShouldSucceed)
            .then(function() {
                return genesisToken.addTokenEmission(15, new BigNumber("1.242508562").mul(precision), forthPeriodEnds);
            })
            .then(Utils.receiptShouldSucceed)
            // .then(function() {
            //     return genesisToken.testDelegatedClaim(accounts[1], emitTokensSince + 3600, {from: accounts[5]});
            // })
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(1000).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "30584826132307692"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "0"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
            // .then(function() {
            //     return genesisToken.testTransfer(emitTokensSince + 7200, accounts[2], new BigNumber(500), {from: accounts[1]});
            // })
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(500).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "0"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
            // .then(function() {
            //     return genesisToken.testTransfer(emitTokensSince + 10800, accounts[3], new BigNumber(150), {from: accounts[2]});
            // })
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(350).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(150).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "15292413066153846"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "0"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
            // .then(function() {
            //     return genesisToken.testTransfer(emitTokensSince + 14400, accounts[4], new BigNumber(43), {from: accounts[3]});
            // })
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(350).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(107).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[4], new BigNumber(43).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "15292413066153846"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "4587723919846153"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "0"))
            // .then(function() {
            //     return genesisToken.testTransfer(emitTokensSince + 18000, accounts[2], new BigNumber(18), {from: accounts[4]});
            // })
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[1], new BigNumber(500).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[2], new BigNumber(368).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[3], new BigNumber(107).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(genesisToken, accounts[4], new BigNumber(25).valueOf()))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[1], "61169652264615384"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[2], "36701791358769230"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[3], "4587723919846153"))
            // .then(() => Utils.balanceShouldEqualTo(claimableToken, accounts[4], "1315147523689230"));
    });

});

*/
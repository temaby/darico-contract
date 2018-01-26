let DaricoGenesis = artifacts.require("./DaricoGenesis.sol");
let DaricoBounty = artifacts.require("./DaricoBounty.sol");
let TestGenesis = artifacts.require("./test/TestGenesisToken.sol");
let Darico = artifacts.require("./Darico.sol");
let Utils = require("./utils");

let BigNumber = require('bignumber.js');
let drcPrecision = new BigNumber(1000000000000000000);

contract('DaricoBounty', function (accounts) {

    it("create contracts create bounties", function () {
        let team = accounts[5];
        let drx, drc, ico, bounty;

        let emitTokensSince = parseInt(new Date().getTime() / 1000);

        return DaricoGenesis.new(
            emitTokensSince,    // uint256 emitSince,
            true, // initGeneration
            0 // initialSupply
        )
            .then((_result) => drx = _result)

            .then(() => {
                return Darico.new(
                    0, // uint256 _initialSupply,
                    // drx.address, // address _genesisToken,
                    new BigNumber(780000).mul(drcPrecision), // uint256 _maxSupply,
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
                    new BigNumber(600000).mul(drcPrecision), // uint256 _maxSupply,
                    18, // uint8 _precision,
                    "Darico Bounty", // string _tokenName,
                    "DARB" // string _symbol
                )
            })
            .then((_result) => bounty = _result)

            .then(() => bounty.drc.call())
            .then((result) => assert.equal(result.valueOf(), drc.address, "drc is not equal"))
            .then(() => bounty.mint(accounts[2], new BigNumber(3).mul(drcPrecision)))
            .then(() => Utils.balanceShouldEqualTo(bounty, accounts[2], new BigNumber(3).mul(drcPrecision).valueOf()))
            .then(() => bounty.setDarico(drc.address))
            .then(Utils.receiptShouldSucceed)
            .then(()=>drc.addMinter(bounty.address))
            .then(() => Utils.balanceShouldEqualTo(bounty, accounts[2], new BigNumber(3).mul(drcPrecision).valueOf()))
            .then(() => bounty.toDarico({from:accounts[2]}))
            .then(Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(drc, accounts[2], new BigNumber(1).mul(drcPrecision).valueOf()))
            .then(() => Utils.balanceShouldEqualTo(bounty, accounts[2], 0))

    });
});

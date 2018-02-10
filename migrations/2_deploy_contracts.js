var Darico = artifacts.require("./Darico.sol");
var DaricoGenesis = artifacts.require("./DaricoGenesis.sol");

const BigNumber = web3.BigNumber;

const currentTimestamp = Math.round(+new Date()/1000);

//DRC token initial parameters
const drcInitialSupply = 0;
const decimals = 18;
const maxSupply = new BigNumber("239959500").mul(10^decimals);
const name = "Darico";
const symbol = "DRC";
const drcTeamAddress = "0x0F76e92493b15b4c800CfaABeB3ED0bB0d442d8f";
// DRX token initial parameters
const emitSince = currentTimestamp;
const initEmission = true;
const drxInitialSupply = 0;
const drxTeamAddress = "0x0F76e92493b15b4c800CfaABeB3ED0bB0d442d8f";

module.exports = function (deployer) {
    deployer.deploy(Darico, drcInitialSupply, maxSupply, decimals, name, symbol, drcTeamAddress).then(function() {
        return deployer.deploy(DaricoGenesis, emitSince, initEmission, drxInitialSupply, Darico.address, drxTeamAddress);
    });
}; 
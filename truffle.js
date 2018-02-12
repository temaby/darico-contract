const Web3 = require("web3");
require('dotenv').config();

const web3 = new Web3();
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

var ropstenPrivateKey = new Buffer(process.env["ROPSTEN_PRIVATE_KEY"].toString(), "hex");
var ropstenWallet = Wallet.fromPrivateKey(ropstenPrivateKey);
var ropstenProvider = new WalletProvider(ropstenWallet, "https://ropsten.infura.io/");


module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        test: {
            host: "localhost",
            port: 8545,
            network_id: "15",
            from: "0x0F67a0fd3165E815434B29CbD59318945b157Ae2",
            gas: 0x47E7C4
        },
        ropsten: {
            provider: ropstenProvider,
            gas: 4700000,
            gasPrice: web3.toWei("20", "gwei"),
            network_id: "3",
          }
    },
    rpc: {
        host: 'localhost',
        post: 8080
    }
};

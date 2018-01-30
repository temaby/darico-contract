var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "P6ydRClUPKb0WkGvwByX";
// test hd key
var mnemonic = "ancient barrel drip arm clever plate ozone smoke rate episode aisle globe";


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
        ropsten_infura: {
            provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
            network_id: 3
        }
    },
    rpc: {
        host: 'localhost',
        post: 8080
    }
};

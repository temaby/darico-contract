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
            from: "0xbdc939c4e44c0fbdceac054ae6f6cd1ea217933b",
            gas: 0x47E7C4
        }
    }
};
pragma solidity ^0.4.13;

import "../libs/contracts/GenesisToken.sol";
import "../libs/contracts/AbstractClaimableToken.sol";
import "../libs/contracts/MintingERC20.sol";
import "./Darico.sol";


contract DaricoGenesis is GenesisToken, MintingERC20 {

    // Constants

    uint8 public  decimals = 0;
    uint256 public  maxSupply = 78 * 10 ** 3 * uint(10) ** decimals;
    string public  symbol = "DRX";
    string public  name = "Darico Genesis";

    event Debug(string _text, uint256 _value);
    event DebugAddress(string _text, address _value);

    // Variables

    AbstractClaimableToken public claimableToken;
    uint256 public createdAt;


    // Functions

    function DaricoGenesis(
        uint256 _emitSince,
        bool _initEmission,
        uint256 _initialSupply)

    GenesisToken(_initialSupply, decimals, name, symbol, true, false, _emitSince)
    MintingERC20(_initialSupply, maxSupply, name, decimals, symbol, true, false)

    {
        standard = "Darico Genesis 0.1";

        createdAt = now;

        // emissions

        if(_initEmission) {
            emissions.push(TokenEmission(15, 9.940068493 * 10 ** 18, 1640995199, false));
            emissions.push(TokenEmission(15, 4.970034247 * 10 ** 18, 1767225599, false));
            emissions.push(TokenEmission(15, 2.485017123 * 10 ** 18, 1893455999, false));
            emissions.push(TokenEmission(15, 1.242508562 * 10 ** 18, 2082758399, false));
        }
    }

    function setClaimableToken(AbstractClaimableToken _token) onlyOwner {
        claimableToken = _token;
    }

    function tokensClaimedHook(address _holder, uint256 since, uint256 till, uint256 tokens) internal {
        if(address(claimableToken) != 0x0) {
          if(mint(_holder, tokens) > 0){
              claimableToken.claimedTokens(_holder, tokens);
          }
        }
        ClaimedTokens(_holder, since, till, tokens);
    }
}
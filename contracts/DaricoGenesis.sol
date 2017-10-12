pragma solidity ^0.4.13;


import "./GenesisToken.sol";
import "./AbstractClaimableToken.sol";
import "./Darico.sol";


contract DaricoGenesis is GenesisToken {

    // Constants

    uint8 public  decimals = 0;

    uint256 public  maxSupply = 78 * 10 ** 3 * uint(10) ** decimals;

    string public  symbol = "DRX";

    string public  name = "Darico Genesis";

    mapping (address => address) public beneficiaries;

    // Variables

    Darico public drc;

    uint256 public createdAt;

    // Events
    event SetBeneficiary(address _drx, address _newBeneficiary);
    // Functions

    function DaricoGenesis(
    uint256 _emitSince,
    bool _initEmission,
    uint256 _initialSupply,
    address _drc
    )

    GenesisToken(_initialSupply, decimals, name, symbol, true, false, _emitSince, maxSupply)
    {
        standard = "Darico Genesis 0.1";

        createdAt = now;
        drc = Darico(_drc);

        // emissions

        if (_initEmission) {
            emissions.push(TokenEmission(15, 9.940068493 * 10 ** 18, 1640995199, false));
            emissions.push(TokenEmission(15, 4.970034247 * 10 ** 18, 1767225599, false));
            emissions.push(TokenEmission(15, 2.485017123 * 10 ** 18, 1893455999, false));
            emissions.push(TokenEmission(15, 1.242508562 * 10 ** 18, 2082758399, false));
        }
    }

    function setDarico(address _tokenAddress) onlyOwner {
        drc = Darico(_tokenAddress);
    }

    function tokensClaimedHook(address _holder, uint256 _since, uint256 _till, uint256 _tokens) internal {
        if (address(drc) != 0x0 && _tokens > 0) {
            uint256 mintedAmount = drc.mint(getBeneficiary(_holder), _tokens);
            require(mintedAmount == _tokens);
        }
        ClaimedTokens(_holder, _since, _till, _tokens);
    }

    function getBeneficiary(address _drxHolder) returns (address){
        address beneficiary = beneficiaries[_drxHolder];

        if (address(0x0) == beneficiary) {
            return _drxHolder;
        }
        else {
            return beneficiary;
        }
    }

    function setBeneficiary(address _beneficiary) {
        require(0x0 != _beneficiary);
        require(balanceOf(msg.sender) > 0);

        // before the beneficiary is changed, claim the currently mined tokens
        claim();

        // change beneficiary
        beneficiaries[msg.sender] = _beneficiary;
        SetBeneficiary(msg.sender, _beneficiary);
    }

}
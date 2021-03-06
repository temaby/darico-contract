pragma solidity ^0.4.15;

import "./AbstractClaimableToken.sol";
import "./GenesisToken.sol";
import "./Darico.sol";


contract DaricoGenesis is GenesisToken {

    // Variables

    uint256 public  maxSupply = uint256(78).mul(10 ** 3).mul(uint(10) ** decimals);
    uint256 public createdAt;
    address public team;

    bool public sentToTeam;

    mapping (address => address) public beneficiaries;

    Darico public drc;

    // Events
    event BeneficiarySet(address _drx, address _newBeneficiary);
    // Functions

    function DaricoGenesis(
        uint256 _emitSince, //
        bool _initEmission, // true
        uint256 _initialSupply, //0
        address _drc,   //
        address _team  //
    )
    GenesisToken(_initialSupply, 0, "Darico Genesis", "DRX", true, false, _emitSince, maxSupply)
    {
        standard = "Darico Genesis 0.1";

        createdAt = block.timestamp;
        drc = Darico(_drc);
        require(_team != address(0));
        team = _team;

        // emissions

        if (_initEmission) {
            emissions.push(TokenEmission(15, 9.940068493 * 10 ** 18, 1640995199, false));
            emissions.push(TokenEmission(15, 4.970034247 * 10 ** 18, 1767225599, false));
            emissions.push(TokenEmission(15, 2.485017123 * 10 ** 18, 1893455999, false));
            emissions.push(TokenEmission(15, 1.242508562 * 10 ** 18, 2082758399, false));
        }
    }

    function sendTeamTokens() public onlyOwner {
        require(sentToTeam == false);
        require(mint(team, 18000) == 18000);
        sentToTeam = true;
    }

    function setDarico(address _tokenAddress) public onlyOwner {
        drc = Darico(_tokenAddress);
    }

    function getBeneficiary(address _drxHolder) public constant returns (address) {
        address beneficiary = beneficiaries[_drxHolder];

        if (address(0) == beneficiary) {
            return _drxHolder;
        } else {
            return beneficiary;
        }
    }

    function setBeneficiary(address _beneficiary) public {
        require(address(0) != _beneficiary);

        // before the beneficiary is changed, claim the currently mined tokens
        claim();

        // change beneficiary
        beneficiaries[msg.sender] = _beneficiary;
        BeneficiarySet(msg.sender, _beneficiary);
    }

    function mint(address _addr, uint256 _amount) public onlyMinters returns (uint256) {
        delegatedClaim(_addr);

        uint256 minted = super.mint(_addr, _amount);

        if (minted == _amount) {
            lastClaims[_addr] = block.timestamp;
        }

        return minted;
    }

    function calculateEmissionTokensForNow(address _address) public constant returns (uint256 tokens) {
        if (block.timestamp < emitTokensSince) {
            return 0;
        }
        if (balanceOf(_address) == 0) {
            lastClaims[_address] = block.timestamp;
            return 0;
        }
        uint256 lastClaimAt = lastClaims[_address];
        if (lastClaimAt == 0) {
            lastClaims[_address] = emitTokensSince;
            lastClaimAt = emitTokensSince;
        }
        if (lastClaimAt >= block.timestamp) {
            return 0;
        }
        return calculateEmissionTokens(lastClaimAt, block.timestamp, balanceOf(_address), totalSupply());
    }

    function tokensClaimedHook(address _holder, uint256 _since, uint256 _till, uint256 _tokens) internal {
        if (address(drc) != address(0) && _tokens > 0) {
            uint256 mintedAmount = drc.mint(getBeneficiary(_holder), _tokens);
            require(mintedAmount == _tokens);
        }

        ClaimedTokens(_holder, _since, _till, _tokens);
    }
}

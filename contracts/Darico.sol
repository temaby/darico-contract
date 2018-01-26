pragma solidity 0.4.15;

import "./MintingERC20.sol";


contract Darico is MintingERC20 {

    // variables
    uint256 public createdAt;
    address public team;

    bool public sentToTeam;

    // functions
    function Darico(
        uint256 _initialSupply, //
        uint256 _maxSupply, //239,959,500.00
        uint8 _precision, //18
        string _tokenName, //Darico
        string _symbol, //DRC
        address _team // Dima
    )
    MintingERC20(_initialSupply, _maxSupply, _tokenName, _precision, _symbol, true, false)
    {
        require(_team != address(0));
        team = _team;
        standard = "Darico Standard 0.1";
        createdAt = block.timestamp;
    }

    function sendTeamTokens() public onlyOwner {
        require(sentToTeam == false);
        require(mint(team, uint256(18000000).mul(uint(10) ** decimals)) == uint256(18000000).mul(uint(10) ** decimals));
        sentToTeam = true;
    }
}
pragma solidity 0.4.15;


import "./Ownable.sol";


contract Multivest is Ownable {
    /* public variables */
    mapping (address => bool) public allowedMultivests;

    /* events */
    event MultivestSet(address multivest);

    event MultivestUnset(address multivest);

    event Contribution(address holder, uint256 value, uint256 tokens);

    modifier onlyAllowedMultivests() {
        require(true == allowedMultivests[msg.sender]);
        _;
    }

    /* constructor */
    function Multivest(address _multivest) {
        allowedMultivests[_multivest] = true;
    }

    /* public methods */
    function() public payable {
        bool status = buy(msg.sender, msg.value);
        require(status == true);
    }

    function setAllowedMultivest(address _address) public onlyOwner {
        allowedMultivests[_address] = true;
    }

    function unsetAllowedMultivest(address _address) public onlyOwner {
        allowedMultivests[_address] = false;
    }

    function multivestBuy(address _address, uint256 _value) public onlyAllowedMultivests {
        bool status = buy(_address, _value);
        require(status == true);
    }

    function buy(address _address, uint256 value) internal returns (bool);

}
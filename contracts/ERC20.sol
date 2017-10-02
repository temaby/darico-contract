pragma solidity ^0.4.13;

import './Ownable.sol';

contract tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData); }

contract ERC20 is Ownable {
    /* Public variables of the token */
    string public standard;

    string public name;

    string public symbol;

    uint8 public decimals;

    uint256 public initialSupply;

    bool public locked;

    uint256 public creationBlock;

    mapping (address => uint256) public balances;

    mapping (address => mapping (address => uint256)) public allowance;

    /* This generates a public event on the blockchain that will notify clients */
    event Transfer(address indexed from, address indexed to, uint256 value);
    event ERCDebug (string _string, uint256 _value);


    modifier onlyPayloadSize(uint numwords) {
        assert(msg.data.length == numwords * 32 + 4);
        _;
    }

    /* Initializes contract with initial supply tokens to the creator of the contract */
    function ERC20(
    uint256 _initialSupply,
    string tokenName,
    uint8 decimalUnits,
    string tokenSymbol,
    bool transferAllSupplyToOwner,
    bool _locked
    ) {
        standard = 'ERC20 0.1';

        initialSupply = _initialSupply;

        if (transferAllSupplyToOwner) {
            setBalance(msg.sender, initialSupply);
        }
        else {
            setBalance(this, initialSupply);
        }

        name = tokenName;
        // Set the name for display purposes
        symbol = tokenSymbol;
        // Set the symbol for display purposes
        decimals = decimalUnits;
        // Amount of decimals for display purposes
        locked = _locked;
        creationBlock = block.number;
    }

    /* internal balances */

    function setBalance(address holder, uint256 amount) internal {
        balances[holder] = amount;
    }

    function transferInternal(address _from, address _to, uint256 value) internal returns (bool success) {
        if (value == 0) {
            return true;
        }
        ERCDebug('balances[_from]',balances[_from]);
        ERCDebug('value',value);
        if (balances[_from] < value) {
            return false;
        }

        if (balances[_to] + value <= balances[_to]) {
            return false;
        }

        setBalance(_from, balances[_from] - value);
        setBalance(_to, balances[_to] + value);

        Transfer(_from, _to, value);

        return true;
    }

    /* public methods */
    function totalSupply() returns (uint256) {
        return initialSupply;
    }

    function balanceOf(address _address) returns (uint256) {
        return balances[_address];
    }

    function transfer(address _to, uint256 _value) onlyPayloadSize(2) returns (bool) {
        require(locked == false);
        ERCDebug('transferE',_value);
        bool status = transferInternal(msg.sender, _to, _value);

        require(status == true);

        return true;
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        if(locked) {
            return false;
        }

        allowance[msg.sender][_spender] = _value;

        return true;
    }

    function approveAndCall(address _spender, uint256 _value, bytes _extraData) returns (bool success) {
        if (locked) {
            return false;
        }

        tokenRecipient spender = tokenRecipient(_spender);

        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        if (locked) {
            return false;
        }

        if (allowance[_from][msg.sender] < _value) {
            return false;
        }

        bool _success = transferInternal(_from, _to, _value);

        if (_success) {
            allowance[_from][msg.sender] -= _value;
        }

        return _success;
    }
}

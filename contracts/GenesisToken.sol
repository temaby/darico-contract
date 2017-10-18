pragma solidity ^0.4.13;

import './MintingERC20.sol';

contract GenesisToken is MintingERC20 {

    /* variables */
    uint256 public emitTokensSince;

    TokenEmission[] public emissions;

    mapping(address => uint256) internal lastClaims;

    /* structs */

    struct TokenEmission {
        uint256 blockDuration;      // duration of block in secs
        uint256 blockTokens;        // tokens per block
        uint256 periodEndsAt;     // duration in secs
        bool removed;
    }

    /* events */

    event ClaimedTokens(address _holder, uint256 _since, uint256 _till, uint256 _tokens);

    /* constructor */

    function GenesisToken(
        uint256 _totalSupply,
        uint8 _precision,
        string _name,
        string _symbol,
        bool _transferAllSupplyToOwner,
        bool _locked,
        uint256 _emitTokensSince,
        uint256 _maxSupply
    )
    MintingERC20(_totalSupply, _maxSupply, _name, _precision, _symbol, _transferAllSupplyToOwner, _locked)
    {
        standard = "GenesisToken 0.1";
        emitTokensSince = _emitTokensSince;
    }

    function addTokenEmission(uint256 _blockDuration, uint256 _blockTokens, uint256 _periodEndsAt) public onlyOwner {
        emissions.push(TokenEmission(_blockDuration, _blockTokens, _periodEndsAt, false));
    }

    function removeTokenEmission(uint256 _i) public onlyOwner {
        require(_i < emissions.length);

        emissions[_i].removed = true;
    }

    function updateTokenEmission(uint256 _i, uint256 _blockDuration, uint256 _blockTokens, uint256 _periodEndsAt) public onlyOwner {
        require(_i < emissions.length);

        emissions[_i].blockDuration = _blockDuration;
        emissions[_i].blockTokens = _blockTokens;
        emissions[_i].periodEndsAt = _periodEndsAt;
    }

    /* this function allows anyone to claim daughter tokens for a specified genesis account;
    no worries, the newly mined tokens will go to genesis holder address
     created for cold storage tokens
    */
//@todo check  for beneficiaries
    function delegatedClaim(address _forAddress) public returns (uint256) {
        require(false == locked);

        uint256 currentBalance = balanceOf(_forAddress);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(now, _forAddress, currentBalance, currentTotalSupply);
    }


    function claim() public returns (uint256) {
        require(false == locked);

        return delegatedClaim(msg.sender);
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        return claimableTransfer(now, _to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        return claimableTransferFrom(now, _from, _to, _value);
    }


    function calculateEmissionTokens(uint256 _lastClaimedAt, uint256 _currentTime, uint256 _currentBalance, uint256 _totalSupply) internal returns (uint256 tokens) {
        uint256 totalTokens = 0;

        uint256 newCurrentTime = _lastClaimedAt;
        uint256 remainingSeconds = _currentTime - _lastClaimedAt;

        uint256 collectedTokensPerPeriod;

        for(uint256 i = 0; i < emissions.length; i++) {
            TokenEmission storage emission = emissions[i];

            if(emission.removed) {
                continue;
            }

            if(newCurrentTime < emission.periodEndsAt) {
                if(newCurrentTime + remainingSeconds > emission.periodEndsAt) {
                    uint256 diff = emission.periodEndsAt  - newCurrentTime;

                    collectedTokensPerPeriod = ((diff / emission.blockDuration) * emission.blockTokens * _currentBalance) / _totalSupply;

                    totalTokens += collectedTokensPerPeriod;

                    remainingSeconds -= diff;
                    newCurrentTime += diff;
                }
                else {
                    collectedTokensPerPeriod = ((remainingSeconds / emission.blockDuration) * emission.blockTokens * _currentBalance) / _totalSupply;

                    totalTokens += collectedTokensPerPeriod;

                    remainingSeconds = 0;
                }
            }

            if (remainingSeconds == 0) {
                break;
            }
        }

        return totalTokens;
    }

    function tokensClaimedHook(address _holder, uint256 _since, uint256 _till, uint256 _tokens) internal {
        ClaimedTokens(_holder, _since, _till, _tokens);
    }

    function claimInternal(uint256 _time, address _address, uint256 _currentBalance, uint256 _currentTotalSupply) internal returns (uint256) {
        if(_time < emitTokensSince) {
            return 0;
        }

        if(_currentBalance == 0) {
            lastClaims[_address] = _time;

            return 0;
        }

        uint256 lastClaimAt = lastClaims[_address];

        if(lastClaimAt == 0) {
            lastClaims[_address] = emitTokensSince;
            lastClaimAt = emitTokensSince;
        }

        if(lastClaimAt >= _time) {
            return 0;
        }

        uint256 tokens = calculateEmissionTokens(lastClaimAt, _time, _currentBalance, _currentTotalSupply);

        if(tokens > 0) {
            tokensClaimedHook(_address, lastClaimAt, _time, tokens);

            lastClaims[_address] = _time;

            return tokens;
        }

        return 0;
    }

    function claimableTransfer(uint256 _time, address _to, uint256 _value) internal returns (bool) {
        uint256 senderCurrentBalance = balanceOf(msg.sender);
        uint256 receiverCurrentBalance = balanceOf(_to);

        uint256 _totalSupply = totalSupply();

        bool status = transferInternal(msg.sender, _to, _value);

        require(status);

        claimInternal(_time, msg.sender, senderCurrentBalance, _totalSupply);
        claimInternal(_time, _to, receiverCurrentBalance, _totalSupply);

        return true;
    }

    function claimableTransferFrom(uint256 _time, address _from, address _to, uint256 _value) internal returns (bool success) {
        uint256 senderCurrentBalance = balanceOf(_from);
        uint256 receiverCurrentBalance = balanceOf(_to);

        uint256 _totalSupply = totalSupply();

        bool status = super.transferFrom(_from, _to, _value);

        if(status) {
            claimInternal(_time, _from, senderCurrentBalance, _totalSupply);
            claimInternal(_time, _to, receiverCurrentBalance, _totalSupply);
        }

        return status;
    }
}
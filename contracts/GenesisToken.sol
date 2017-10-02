pragma solidity ^0.4.13;

import './ERC20.sol';

contract GenesisToken is ERC20 {
    uint256 public emitTokensSince;

    TokenEmission[] public emissions;

    mapping(address => uint256) lastClaims;

    /* structs */

    struct TokenEmission {
    uint256 blockDuration;      // duration of block in secs
    uint256 blockTokens;        // tokens per block
    uint256 periodEndsAt;     // duration in secs
    bool removed;
    }

    /* events */

    event ClaimedTokens(address _holder, uint256 since, uint256 till, uint256 tokens);

    /* constructor */

    function GenesisToken(
    uint256 totalSupply,
    uint8 precision,
    string name, string symbol,
    bool transferAllSupplyToOwner,
    bool locked,
    uint256 _emitTokensSince
    )
    ERC20(totalSupply, name, precision, symbol, transferAllSupplyToOwner, locked)
    {
        standard = "GenesisToken 0.1";

        emitTokensSince = _emitTokensSince;
    }

    function addTokenEmission(uint256 blockDuration, uint256 blockTokens, uint256 periodEndsAt) onlyOwner {
        emissions.push(TokenEmission(blockDuration, blockTokens, periodEndsAt, false));
    }

    function removeTokenEmission(uint256 i) onlyOwner {
        require(i < emissions.length);

        emissions[i].removed = true;
    }

    function updateTokenEmission(uint256 i, uint256 blockDuration, uint256 blockTokens, uint256 periodEndsAt) onlyOwner {
        require(i < emissions.length);

        emissions[i].blockDuration = blockDuration;
        emissions[i].blockTokens = blockTokens;
        emissions[i].periodEndsAt = periodEndsAt;
    }

    function calculateEmissionTokens(uint256 lastClaimedAt, uint256 currentTime, uint256 currentBalance, uint256 totalSupply) returns (uint256 tokens) {
        uint256 totalTokens = 0;

        uint256 newCurrentTime = lastClaimedAt;
        uint256 remainingSeconds = currentTime - lastClaimedAt;

        uint256 collectedTokensPerPeriod;

        for(uint256 i = 0; i < emissions.length; i++) {
            TokenEmission storage emission = emissions[i];

            if(emission.removed) {
                continue;
            }

            if(newCurrentTime < emission.periodEndsAt) {
                if(newCurrentTime + remainingSeconds > emission.periodEndsAt) {
                    uint256 diff = emission.periodEndsAt  - newCurrentTime;

                    collectedTokensPerPeriod = ((diff / emission.blockDuration) * emission.blockTokens * currentBalance) / totalSupply;

                    totalTokens += collectedTokensPerPeriod;

                    remainingSeconds -= diff;
                    newCurrentTime += diff;
                }
                else {
                    collectedTokensPerPeriod = ((remainingSeconds / emission.blockDuration) * emission.blockTokens * currentBalance) / totalSupply;

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

    function tokensClaimedHook(address _holder, uint256 since, uint256 till, uint256 tokens) internal {
        ClaimedTokens(_holder, since, till, tokens);
    }

    function claimInternal(uint256 time, address _address, uint256 currentBalance, uint256 currentTotalSupply) internal returns (uint256) {
        if(time < emitTokensSince) {
            return 0;
        }

        if(currentBalance == 0) {
            lastClaims[_address] = time;

            return 0;
        }

        uint256 lastClaimAt = lastClaims[_address];

        if(lastClaimAt == 0) {
            lastClaims[_address] = emitTokensSince;
            lastClaimAt = emitTokensSince;
        }

        if(lastClaimAt >= time) {
            return 0;
        }

        uint256 tokens = calculateEmissionTokens(lastClaimAt, time, currentBalance, currentTotalSupply);

        if(tokens > 0) {
            tokensClaimedHook(_address, lastClaimAt, time, tokens);

            lastClaims[_address] = time;

            return tokens;
        }

        return 0;
    }


    /* this function allows anyone to claim daughter tokens for a specified genesis account;
    no worries, the newly mined tokens will go to genesis holder address
    */
    function delegatedClaim(address forAddress) returns (uint256) {
        require(false == locked);

        uint256 currentBalance = balanceOf(forAddress);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(now, forAddress, currentBalance, currentTotalSupply);
    }


    function claim() returns (uint256) {
        require(false == locked);

        return delegatedClaim(msg.sender);
    }


    function claimableTransfer(uint256 time, address _to, uint256 _value) internal returns (bool) {
        uint256 senderCurrentBalance = balanceOf(msg.sender);
        uint256 receiverCurrentBalance = balanceOf(_to);

        uint256 _totalSupply = totalSupply();

        bool status = transferInternal(msg.sender, _to, _value);

        require(status);

        claimInternal(time, msg.sender, senderCurrentBalance, _totalSupply);
        claimInternal(time, _to, receiverCurrentBalance, _totalSupply);

        return true;
    }

    function transfer(address _to, uint256 _value) returns (bool) {
        return claimableTransfer(now, _to, _value);
    }

    function claimableTransferFrom(uint256 time, address _from, address _to, uint256 _value) returns (bool success) {
        uint256 senderCurrentBalance = balanceOf(_from);
        uint256 receiverCurrentBalance = balanceOf(_to);

        uint256 _totalSupply = totalSupply();

        bool status = super.transferFrom(_from, _to, _value);

        if(status) {
            claimInternal(time, _from, senderCurrentBalance, _totalSupply);
            claimInternal(time, _to, receiverCurrentBalance, _totalSupply);
        }

        return status;
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        return claimableTransferFrom(now, _from, _to, _value);
    }
}
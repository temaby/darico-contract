pragma solidity 0.4.15;

import "./MintingERC20.sol";


contract GenesisToken is MintingERC20 {
    /* variables */
    uint256 public emitTokensSince;

    TokenEmission[] public emissions;

    mapping(address => uint256) public lastClaims;

    /* structs */
    struct TokenEmission {
        uint256 blockDuration;      // duration of block in secs
        uint256 blockTokens;        // tokens per block
        uint256 periodEndsAt;     // duration in secs
        bool removed;
    }

    /* events */
    event ClaimedTokens(address _holder, uint256 _since, uint256 _till, uint256 _tokens);
    event Debug(string _s, uint256 _v);

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

    function updateTokenEmission(uint256 _i, uint256 _blockDuration, uint256 _blockTokens, uint256 _periodEndsAt)
        public
        onlyOwner
    {
        require(_i < emissions.length);

        emissions[_i].blockDuration = _blockDuration;
        emissions[_i].blockTokens = _blockTokens;
        emissions[_i].periodEndsAt = _periodEndsAt;
    }

    /* this function allows anyone to claim daughter tokens for a specified genesis account;
    no worries, the newly mined tokens will go to genesis holder address
     created for cold storage tokens
    */
    function delegatedClaim(address _forAddress) public returns (uint256) {
        require(false == locked);

        uint256 currentBalance = balanceOf(_forAddress);
        uint256 currentTotalSupply = totalSupply();

        return claimInternal(block.timestamp, _forAddress, currentBalance, currentTotalSupply);
    }

    function claim() public returns (uint256) {
        require(false == locked);

        return delegatedClaim(msg.sender);
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        return claimableTransfer(block.timestamp, _to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        return claimableTransferFrom(block.timestamp, _from, _to, _value);
    }

    /* internal methods */
    function getPeriodMinedTokens(
        uint256 _duration, uint256 _balance,
        uint256 _blockDuration, uint256 _blockTokens,
        uint256
    )
    internal returns (uint256)
    {
        uint256 blocks = _duration.div(_blockDuration);
        Debug("blocks", blocks);
        Debug("res", blocks.mul(_blockTokens).mul(_balance).div(maxSupply));
        return blocks.mul(_blockTokens).mul(_balance).div(maxSupply);
    }

    function calculateEmissionTokens(
        uint256 _lastClaimedAt,
        uint256 _currentTime,
        uint256 _currentBalance,
        uint256 _totalSupply
    )
    internal returns (uint256 tokens)
    {
        uint256 totalTokens = 0;

        Debug("--------------------------------------", 0);

        uint256 newCurrentTime = _lastClaimedAt;
        uint256 remainingSeconds = _currentTime.sub(_lastClaimedAt);

        Debug("_lastClaimedAt", _lastClaimedAt);
        Debug("_currentTime", _currentTime);
        Debug("remainingSeconds", remainingSeconds);

        uint256 collectedTokensPerPeriod;

        for (uint256 i = 0; i < emissions.length; i++) {
            Debug("------------", 0);

            TokenEmission storage emission = emissions[i];

            Debug("emission.removed", emission.removed ? 1 : 0);

            if (emission.removed) {
                continue;
            }

            Debug("newCurrentTime", newCurrentTime);
            Debug("emission.periodEndsAt", emission.periodEndsAt);
            Debug("newCurrentTime < emission.periodEndsAt", newCurrentTime < emission.periodEndsAt ? 1 : 0);

            if (newCurrentTime < emission.periodEndsAt) {
                Debug("newCurrentTime.add(remainingSeconds) > emission.periodEndsAt", newCurrentTime.add(remainingSeconds) > emission.periodEndsAt ? 1 : 0);

                if (newCurrentTime.add(remainingSeconds) > emission.periodEndsAt) {
                    uint256 diff = emission.periodEndsAt.sub(newCurrentTime);

                    Debug("diff", diff);

                    collectedTokensPerPeriod = getPeriodMinedTokens(
                        diff, _currentBalance,
                        emission.blockDuration, emission.blockTokens,
                        _totalSupply);

                    totalTokens += collectedTokensPerPeriod;

                    newCurrentTime += diff;
                    remainingSeconds -= diff;
                } else {
                    collectedTokensPerPeriod = getPeriodMinedTokens(remainingSeconds, _currentBalance,
                        emission.blockDuration, emission.blockTokens,
                        _totalSupply);

                    totalTokens += collectedTokensPerPeriod;

                    newCurrentTime += remainingSeconds;
                    remainingSeconds = 0;
                }

                Debug("collectedTokensPerPeriod", collectedTokensPerPeriod);
                Debug("totalTokens", totalTokens);
                Debug("newCurrentTime", newCurrentTime);
                Debug("remainingSeconds", remainingSeconds);
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

    function claimInternal(
        uint256 _time,
        address _address,
        uint256 _currentBalance,
        uint256 _currentTotalSupply
    )
    internal returns (uint256)
    {
        if (_time < emitTokensSince) {
            return 0;
        }

        if (_currentBalance == 0) {
            lastClaims[_address] = _time;

            return 0;
        }

        uint256 lastClaimAt = lastClaims[_address];

        if (lastClaimAt == 0) {
            lastClaims[_address] = emitTokensSince;
            lastClaimAt = emitTokensSince;
        }

        if (lastClaimAt >= _time) {
            return 0;
        }

        uint256 tokens = calculateEmissionTokens(lastClaimAt, _time, _currentBalance, _currentTotalSupply);

        if (tokens > 0) {
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

    function claimableTransferFrom(
        uint256 _time,
        address _from,
        address _to,
        uint256 _value
    )
    internal returns (bool success)
    {
        uint256 senderCurrentBalance = balanceOf(_from);
        uint256 receiverCurrentBalance = balanceOf(_to);

        uint256 _totalSupply = totalSupply();

        bool status = super.transferFrom(_from, _to, _value);

        if (status) {
            claimInternal(_time, _from, senderCurrentBalance, _totalSupply);
            claimInternal(_time, _to, receiverCurrentBalance, _totalSupply);
        }

        return status;
    }
}
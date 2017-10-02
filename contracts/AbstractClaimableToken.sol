pragma solidity ^0.4.13;

contract AbstractClaimableToken {
    function claimedTokens(address _holder, uint256 tokens);
}
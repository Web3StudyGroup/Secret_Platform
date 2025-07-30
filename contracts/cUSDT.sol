// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {
    ConfidentialFungibleTokenERC20Wrapper
} from "@openzeppelin/confidential-contracts/token/extensions/ConfidentialFungibleTokenERC20Wrapper.sol";
import {ConfidentialFungibleToken} from "@openzeppelin/confidential-contracts/token/ConfidentialFungibleToken.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title cUSDT - Confidential USDT Token
/// @notice A confidential ERC20 token wrapped around regular USDT using FHE
/// @dev This contract wraps a regular ERC20 USDT token to provide confidential transactions
contract cUSDT is ConfidentialFungibleTokenERC20Wrapper, SepoliaConfig {
    /// @notice Constructor to initialize the confidential USDT token
    /// @param underlyingToken The address of the underlying USDT token to wrap
    constructor(
        IERC20 underlyingToken
    )
        ConfidentialFungibleTokenERC20Wrapper(underlyingToken)
        ConfidentialFungibleToken("Confidential USDT", "cUSDT", "")
    {
        // Constructor body - the parent constructors handle initialization
    }

    /// @notice Override decimals to return 6 for USDT compatibility
    /// @return The number of decimals (6 for USDT)
    function decimals() public view virtual override returns (uint8) {
        return 6; // USDT typically uses 6 decimals
    }
}

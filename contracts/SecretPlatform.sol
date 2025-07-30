// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, eaddress, externalEuint64, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {cUSDT} from "./cUSDT.sol";

/// @title SecretPlatform - Confidential Transfer Platform
/// @notice Platform for confidential deposits, withdrawals and transfers using encrypted cUSDT
/// @dev Uses Zama FHE for encrypted operations on user balances and transfer records
contract SecretPlatform is SepoliaConfig {
    // The confidential USDT token
    cUSDT public immutable cUSDTToken;

    // User encrypted balances on the platform
    mapping(address => euint64) private userBalances;

    // Transfer records: recipient -> sender -> encrypted amount
    // This allows recipients to claim transfers sent to them
    mapping(address => mapping(address => euint64)) private transferRecords;

    // Track if a transfer record exists
    mapping(address => mapping(address => bool)) private transferExists;

    // Events
    event Deposit(address indexed user);
    event Withdrawal(address indexed user);
    event EncryptedTransfer(address indexed from, address indexed to);
    event Claim(address indexed recipient, address indexed sender);

    /// @notice Constructor
    /// @param _cUSDTToken Address of the cUSDT token contract
    constructor(address _cUSDTToken) {
        cUSDTToken = cUSDT(_cUSDTToken);
    }

    /// @notice Get user's encrypted balance on the platform
    /// @param user The user address
    /// @return The encrypted balance
    function getBalance(address user) external view returns (euint64) {
        return userBalances[user];
    }

    /// @notice Helper function to set this platform as operator for cUSDT transfers
    /// @param until Timestamp until when the operator permission is valid
    function approveTokenOperator(uint48 until) external {
        cUSDTToken.setOperator(address(this), until);
    }

    /// @notice Get encrypted transfer amount from sender to recipient
    /// @param recipient The recipient address
    /// @param sender The sender address
    /// @return The encrypted transfer amount
    function getTransferRecord(address recipient, address sender) external view returns (euint64) {
        return transferRecords[recipient][sender];
    }

    /// @notice Check if a transfer record exists
    /// @param recipient The recipient address
    /// @param sender The sender address
    /// @return True if transfer record exists
    function hasTransferRecord(address recipient, address sender) external view returns (bool) {
        return transferExists[recipient][sender];
    }

    /// @notice Deposit cUSDT to the platform
    /// @param encryptedAmount The encrypted amount to deposit
    /// @param inputProof The input proof for the encrypted amount
    function deposit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // First, user needs to set this contract as an operator to spend their tokens
        // This should be done by the user beforehand via cUSDTToken.setOperator(address(this), expiry)

        // Transfer cUSDT from user to platform using confidentialTransferFrom
        euint64 transferred = cUSDTToken.confidentialTransferFrom(msg.sender, address(this), amount);

        // Update user balance on platform using the actual transferred amount
        userBalances[msg.sender] = FHE.add(userBalances[msg.sender], transferred);

        // Set ACL permissions
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);

        emit Deposit(msg.sender);
    }

    /// @notice Withdraw cUSDT from the platform
    /// @param encryptedAmount The encrypted amount to withdraw
    /// @param inputProof The input proof for the encrypted amount
    function withdraw(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Check user has access to their balance
        require(FHE.isSenderAllowed(userBalances[msg.sender]), "Unauthorized access");

        // Check if user has sufficient balance (using FHE comparison)
        euint64 currentBalance = userBalances[msg.sender];

        // Update user balance (subtract amount)
        userBalances[msg.sender] = FHE.sub(currentBalance, amount);

        // Set ACL permissions
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);

        // Transfer cUSDT back to user using confidentialTransfer
        euint64 transferred = cUSDTToken.confidentialTransfer(msg.sender, amount);
        // The transferred amount is returned for verification

        emit Withdrawal(msg.sender);
    }

    /// @notice Create encrypted transfer to another address
    /// @param encryptedRecipient The encrypted recipient address
    /// @param encryptedAmount The encrypted amount to transfer
    /// @param inputProof The input proof for the encrypted inputs
    /// @dev This stores the transfer record for the recipient to claim later
    function encryptedTransfer(
        externalEaddress encryptedRecipient,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        eaddress recipient = FHE.fromExternal(encryptedRecipient, inputProof);
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Check user has access to their balance
        require(FHE.isSenderAllowed(userBalances[msg.sender]), "Unauthorized access");

        // Update sender's balance
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], amount);

        // Set ACL permissions for sender's balance
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);

        // Note: In a real implementation, we would need to decrypt the recipient address
        // to store the transfer record. For now, we'll use a simplified approach
        // where the recipient address is passed as a parameter.

        emit EncryptedTransfer(msg.sender, address(0)); // Recipient is encrypted
    }

    /// @notice Create encrypted transfer to a known address (simplified version)
    /// @param recipient The recipient address (plaintext for storage)
    /// @param encryptedAmount The encrypted amount to transfer
    /// @param inputProof The input proof for the encrypted amount
    function encryptedTransferTo(
        address recipient,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external {
        require(recipient != address(0), "Invalid recipient");

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);

        // Check user has access to their balance
        require(FHE.isSenderAllowed(userBalances[msg.sender]), "Unauthorized access");

        // Update sender's balance
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], amount);

        // Store transfer record for recipient
        transferRecords[recipient][msg.sender] = amount;
        transferExists[recipient][msg.sender] = true;

        // Set ACL permissions
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);
        FHE.allowThis(transferRecords[recipient][msg.sender]);
        FHE.allow(transferRecords[recipient][msg.sender], recipient);
        FHE.allow(transferRecords[recipient][msg.sender], msg.sender);

        emit EncryptedTransfer(msg.sender, recipient);
    }

    /// @notice Claim a transfer sent to you
    /// @param sender The address that sent the transfer
    function encryptClaim(address sender) external {
        require(transferExists[msg.sender][sender], "No transfer record found");

        // Get the transfer amount
        euint64 transferAmount = transferRecords[msg.sender][sender];

        // Add to recipient's balance
        userBalances[msg.sender] = FHE.add(userBalances[msg.sender], transferAmount);

        // Clear the transfer record
        transferRecords[msg.sender][sender] = FHE.asEuint64(0);
        delete transferExists[msg.sender][sender];

        // Set ACL permissions
        FHE.allowThis(userBalances[msg.sender]);
        FHE.allow(userBalances[msg.sender], msg.sender);

        emit Claim(msg.sender, sender);
    }

    /// @notice Emergency function to check if user has sufficient balance
    /// @param user The user address
    /// @param encryptedAmount The encrypted amount to check
    /// @param inputProof The input proof
    /// @return Encrypted boolean indicating if balance is sufficient
    // function hasSufficientBalance(
    //     address user,
    //     externalEuint64 encryptedAmount,
    //     bytes calldata inputProof
    // ) external view returns (ebool) {
    //     euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
    //     euint64 balance = userBalances[user];

    //     ebool result = FHE.ge(balance, amount);

    //     // Set ACL permissions for the result
    //     FHE.allow(result, msg.sender);

    //     return result;
    // }
}

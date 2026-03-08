// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SubsidyVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant FUNDER_ROLE = keccak256("FUNDER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    IERC20 public immutable momToken;

    mapping(uint256 => bool) public isNullifierUsed;

    // Subsidy amounts in MOM tokens (assuming 18 decimals for MOM token)
    uint256 public constant PRENATAL_AMOUNT = 20 * 10**18; // 20 MOM tokens
    uint256 public constant PARTO_AMOUNT = 50 * 10**18;    // 50 MOM tokens
    uint256 public constant POSTPARTO_AMOUNT = 30 * 10**18; // 30 MOM tokens

    event SubsidyClaimed(
        address indexed beneficiary,
        uint256 nullifierHash,
        string controlType,
        uint256 amount
    );

    constructor(address _momTokenAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(FUNDER_ROLE, msg.sender);
        momToken = IERC20(_momTokenAddress);
    }

    function deposit(uint256 amount) public onlyRole(FUNDER_ROLE) {
        require(momToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    function claim(
        address beneficiary,
        uint256 nullifierHash,
        string calldata controlType
    ) public virtual nonReentrant whenNotPaused onlyRole(EXECUTOR_ROLE) {
        require(!isNullifierUsed[nullifierHash], "Subsidy already claimed for this nullifier");

        uint256 amount;
        if (keccak256(abi.encodePacked(controlType)) == keccak256(abi.encodePacked("PRENATAL"))) {
            amount = PRENATAL_AMOUNT;
        } else if (keccak256(abi.encodePacked(controlType)) == keccak256(abi.encodePacked("PARTO"))) {
            amount = PARTO_AMOUNT;
        } else if (keccak256(abi.encodePacked(controlType)) == keccak256(abi.encodePacked("POSTPARTO"))) {
            amount = POSTPARTO_AMOUNT;
        } else {
            revert("Invalid control type");
        }

        require(momToken.balanceOf(address(this)) >= amount, "Insufficient funds in vault");

        isNullifierUsed[nullifierHash] = true;
        require(momToken.transfer(beneficiary, amount), "Token transfer failed");

        emit SubsidyClaimed(beneficiary, nullifierHash, controlType, amount);
    }

    // Function to renounce roles (optional, but good practice)
    function renounceRole(bytes32 role, address account) public virtual override {
        super.renounceRole(role, account);
    }
}

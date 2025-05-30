// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Inheritance {
    address public owner;
    address public beneficiary;
    uint256 public lastCheckIn;
    uint256 public inactivityPeriod; // e.g., 30 days

    event CheckIn(address indexed owner, uint256 timestamp);
    event InheritanceTriggered(address indexed beneficiary, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier onlyWhenInactive() {
        require(block.timestamp >= lastCheckIn + inactivityPeriod, "Owner still active");
        _;
    }

    constructor(address _beneficiary, uint256 _inactivityPeriod) payable {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_inactivityPeriod > 0, "Inactivity period must be > 0");
        owner = msg.sender;
        beneficiary = _beneficiary;
        inactivityPeriod = _inactivityPeriod;
        lastCheckIn = block.timestamp;
    }

    // Called by the owner to confirm they are still alive/active
    function checkIn() external onlyOwner {
        lastCheckIn = block.timestamp;
        emit CheckIn(msg.sender, lastCheckIn);
    }

    // Trigger the inheritance process if the owner is inactive
    function triggerInheritance() external onlyWhenInactive {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to transfer");

        // Transfer all contract funds to the beneficiary
        (bool sent, ) = beneficiary.call{value: balance}("");
        require(sent, "Transfer failed");

        emit InheritanceTriggered(beneficiary, balance);
    }

    // Allow the owner to update the beneficiary
    function updateBeneficiary(address _newBeneficiary) external onlyOwner {
        require(_newBeneficiary != address(0), "Invalid beneficiary");
        beneficiary = _newBeneficiary;
    }

    // Allow the owner to deposit funds into the contract
    receive() external payable {}
}

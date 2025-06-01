// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract Inheritance is Ownable, ReentrancyGuard{

    address private s_beneficiary;
    address private s_monitoringServiceAddress;
    uint256 private s_amount;
    uint256 private s_inactivityTime;
    uint256 private lastActivityTimestamp;

    bool private inheritanceTriggered;
    bool private inheritanceClaimed;
    bool private isActiveForMonitoring;

    //errors
    error Inhertiance__AmountTransferToBeneficiaryFailed();
    error Inheritance__WithdrawalFailed();

    //events
    event ActivityUpdated(uint256 timestamp);
    event InheritanceTriggered(uint256 timestamp);
    event InheritanceClaimed(address beneficiary, uint256 amount);
    event MonitoringDeactivated();

    constructor(
        address _owner,
        address _beneficiary,
        address _monitoringServiceAddress,
        uint256 _amount,
        uint256 _inactivityTime        
    ) payable Ownable(_owner) {
        require(_owner != address(0), "Invalid owner address");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_monitoringServiceAddress != address(0), "Invalid monitoring service address");
        require(_amount > 0, "Amount must be greater than zero");
        require(msg.value == _amount, "Sent value must equal specified amount");

        s_beneficiary = _beneficiary;
        s_monitoringServiceAddress = _monitoringServiceAddress;
        s_amount = _amount;
        s_inactivityTime = _inactivityTime;
        lastActivityTimestamp = block.timestamp;
        inheritanceTriggered = false;
        inheritanceClaimed = false;
        isActiveForMonitoring = true;
    }   

    modifier onlyActiveOwner() {
        require(msg.sender == owner(), "Only owner can call this");
        require(!inheritanceTriggered, "Inheritance already triggered, owner cant pull out funds anymore");
        _;
    }

    modifier onlyBeneficiary(){
        require(msg.sender == s_beneficiary, "Only beneficiary can call this");
        require(inheritanceTriggered, "Inheritance not triggered yet");
        require(!inheritanceClaimed, "Inheritance already claimed");
        _;
    }

    modifier onlyMonitoringService() {
        require(msg.sender == s_monitoringServiceAddress, "Only monitoring service can call this");
        require(isActiveForMonitoring, "Contract no longer needs monitoring");
        _;
    }

    function processInheritanceCheck(bool walletHasActivity) external onlyMonitoringService nonReentrant {
        require(!inheritanceTriggered, "Inheritance already triggered");
        
        if (walletHasActivity) {
            lastActivityTimestamp = block.timestamp;
            emit ActivityUpdated(block.timestamp);
        } else {
            if ((block.timestamp - lastActivityTimestamp) >= s_inactivityTime) {
                inheritanceTriggered = true;
                emit InheritanceTriggered(block.timestamp);

                isActiveForMonitoring = false; 
                emit MonitoringDeactivated();
            }
        }
    }

    function claimInheritance() external nonReentrant onlyBeneficiary {
        (bool success,)= payable(s_beneficiary).call{value: s_amount}("");
        if (!success) {
            revert Inhertiance__AmountTransferToBeneficiaryFailed();
        }

        inheritanceClaimed = true;
        emit InheritanceClaimed(s_beneficiary, s_amount);

        isActiveForMonitoring = false;
        emit MonitoringDeactivated();        
    }

    function emergencyWithdraw() external onlyActiveOwner nonReentrant {
        isActiveForMonitoring = false;
        
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success){
            revert Inheritance__WithdrawalFailed();
        }
        
        emit MonitoringDeactivated();
    }

    function resetActivity() external onlyActiveOwner {
        lastActivityTimestamp = block.timestamp;
        emit ActivityUpdated(block.timestamp);
    }

    // getters
    function getOwner() external view returns (address) {
        return owner();
    }

    function getBeneficiary() external view returns (address) {
        return s_beneficiary;
    }

    function getMonitoringServiceAddress() external view returns (address) {
        return s_monitoringServiceAddress;
    }
    
    function getAmount() external view returns (uint256) {
        return s_amount;
    }

    function getInactivityTime() external view returns (uint256) {
        return s_inactivityTime;
    }

    function getLastActivityTimestamp() external view returns (uint256) {
        return lastActivityTimestamp;
    } 

    function getIsInheritanceTriggered() external view returns (bool) {
        return inheritanceTriggered;
    }

    function getIsInheritanceClaimed() external view returns (bool) {
        return inheritanceClaimed;
    }

    function getIsActiveForMonitoring() external view returns (bool) {
        return isActiveForMonitoring;
    }

    function getContractDetails() external view returns (
        address _beneficiary,
        uint256 _amount,
        uint256 _inactivityTime,
        uint256 _lastActivity,
        bool _triggered,
        bool _claimed,
        uint256 _timeRemaining,
        bool _needsMonitoring
    ) {
        uint256 timeRemaining = 0;
        if (!inheritanceTriggered && (block.timestamp - lastActivityTimestamp) < s_inactivityTime) {
            timeRemaining = s_inactivityTime - (block.timestamp - lastActivityTimestamp);
        }

        return (
            s_beneficiary,
            s_amount,
            s_inactivityTime,
            lastActivityTimestamp,
            inheritanceTriggered,
            inheritanceClaimed,
            timeRemaining,
            isActiveForMonitoring
        );
    }

    //fallback    
    receive() external payable {}

    fallback() external payable {}    
}
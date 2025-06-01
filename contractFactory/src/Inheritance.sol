// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract Inheritance is Ownable, ReentrancyGuard{

    address immutable public s_owner;
    address public s_beneficiary;
    address public s_monitoringServiceAddress;
    uint256 public s_amount;
    uint256 public s_inactivityTime;
    uint256 public lastActivityTimestamp;

    bool public inheritanceTriggered;
    bool public inheritanceClaimed;
    bool public isActiveForMonitoring;

    //events
    event InheritanceTriggered(uint256 timestamp);
    event InheritanceClaimed(address beneficiary, uint256 amount);
    event MonitoringDeactivated();

    constructor(
        address _beneficiary,
        address _monitoringServiceAddress,
        uint256 _amount,
        uint256 _inactivityTime        
    ) payable Ownable(msg.sender) {

        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_monitoringServiceAddress != address(0), "Invalid monitoring service address");
        require(msg.value == _amount, "Amount must be greater than zero");

        s_owner = msg.sender;
        s_beneficiary = _beneficiary;
        s_monitoringServiceAddress = _monitoringServiceAddress;
        s_amount = _amount;
        s_inactivityTime = _inactivityTime;
        lastActivityTimestamp = block.timestamp;
        inheritanceTriggered = false;
        inheritanceClaimed = false;
        isActiveForMonitoring = true;
    }   

    modifier onlyOwner() override{
        require(msg.sender == s_owner, "Only owner can call this");
        require(!inheritanceTriggered, "Inheritance already triggered, owner cant pull out funds anymore");
        _;
    }

    modifier onlyMonitoringService() {
        require(msg.sender == s_monitoringServiceAddress, "Only monitoring service can call this");
        require(isActiveForMonitoring, "Contract no longer needs monitoring");
        _;
    }
    
}
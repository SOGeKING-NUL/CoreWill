// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "./Inheritance.sol";
import {Ownable} from "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract InheritanceFactory is Ownable{

    address[] private deployedContracts;
    address[] private activeContracts;
    mapping(address => address[]) private userContracts;
    mapping(address => address[]) private beneficiaryContracts;
    mapping(address => bool) private contractActive;
    address private i_monitoringService;

    // Events
    event ContractDeployed(
        address indexed contractAddress, 
        address indexed owner, 
        address indexed beneficiary,
        uint256 amount,
        uint256 inactivityTime
    );
    event MonitoringDeactivated(address indexed contractAddress);

    //errors
    error InheritanceFactory__ContractAlreadyInactive();


    constructor() Ownable(msg.sender) {
        i_monitoringService = msg.sender; 
    }

    modifier onlyMonitoringService() {
        require(msg.sender == i_monitoringService, "Only monitoring service can call this function");
        _;
    }

    function deployInheritanceContract(address _beneficiary, uint256 _inactivityTime) payable external returns (address) {
        require(msg.sender != i_monitoringService, "Monitoring service cannot deploy an inheritance contract");
        require(msg.value > 0, "Amount must be greater than zero");
        require(_beneficiary != address(0), "Invalid beneficiary address");

        Inheritance newContract= new Inheritance{value: msg.value}(
            msg.sender, 
            _beneficiary, 
            i_monitoringService, 
            msg.value, 
            _inactivityTime
        );

        address contractAddress = address(newContract);

        //updating mappings and arrays
        deployedContracts.push(contractAddress);
        userContracts[msg.sender].push(contractAddress);
        activeContracts.push(contractAddress); 
        beneficiaryContracts[_beneficiary].push(contractAddress);
        contractActive[contractAddress] = true;

        emit ContractDeployed(
            contractAddress, 
            msg.sender, 
            _beneficiary, 
            msg.value, 
            _inactivityTime
        );

        return contractAddress;
    }

    function processContractMonitoring(address contractAddress, bool walletHasActivity) external onlyMonitoringService{

        if (!contractActive[contractAddress]) {
            revert InheritanceFactory__ContractAlreadyInactive();
        }
        
        try Inheritance(payable(contractAddress)).processInheritanceCheck(walletHasActivity) returns (bool needsDeactivation) {
            if (needsDeactivation) {
                _removeFromActiveContracts(contractAddress);
            }
        } catch {

            // If call fails, assume contract is inactive and remove it
            _removeFromActiveContracts(contractAddress);
        }
    }

    function _removeFromActiveContracts(address contractAddress) internal {

        for (uint256 i = 0; i < activeContracts.length; i++) {
            if (activeContracts[i] == contractAddress) {
                activeContracts[i] = activeContracts[activeContracts.length - 1]; //swap
                activeContracts.pop();
                break;
            }
        }

        contractActive[contractAddress] = false;
        emit MonitoringDeactivated(contractAddress);
    }
    
    function emergencyDeactivateContract(address contractAddress) external onlyOwner {
    if (contractActive[contractAddress]) {
        _removeFromActiveContracts(contractAddress);
    }
}

    //getters
    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }

    function getActiveContracts() external view returns (address[] memory) {
        return activeContracts;
    }
    function getUserContracts(address user) external view returns (address[] memory) {
        return userContracts[user];
    }

    function getBeneficiaryContracts(address beneficiary) external view returns (address[] memory) {
        return beneficiaryContracts[beneficiary];
    }

    function getisContractActive(address contractAddress) external view returns (bool) {
        return contractActive[contractAddress];
    }

    function getMonitoringService() external view returns (address) {
        return i_monitoringService;
    }

    function getContractCount() external view returns (uint256) {
        return deployedContracts.length;
    }

    function getActiveContractCount() external view returns (uint256) {
        return activeContracts.length;
    }

}
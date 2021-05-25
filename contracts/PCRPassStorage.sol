// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Counters.sol";
import {LibDiamond} from "./diamond/libraries/LibDiamond.sol";

enum Gender {Male, Female}
enum OrganizationRole {Issuer, Business}
enum TestResult {Negative, Positive}

struct Person {
    bytes32 firstName;
    bytes32 lastName;
    bytes32 birth;
    Gender gender;
    uint[] residence;
    bytes32 phone;
    bytes32 mail;
    string photo;
}

struct Organization {
    OrganizationRole role;
    bytes32 name;
    bytes32 representative;
    uint[] streetAddress;
    bytes32 phone;
    bytes32 mail;
}

struct TestRequest {
    address userAccount;
    Person user;
    address issuerAccount;
    Organization issuer;
    uint256 requestedAt;
    uint256 issuedAt;
}

struct Certificate {
    uint256 requestId;
    TestRequest request;
    bytes32 sampleId;
    bytes32 sample;
    bytes32 collectionMethod;
    bytes32 collectionDate;
    bytes32 testMethod;
    TestResult result;
    bytes32 resultDate;
    string fileHash;
    uint256 issuedAt;
    uint256 expireAt;
}

struct PCRPassStorage {
    mapping(address => Person) people;
    mapping(address => Organization) organizations;
    address[] organizationAccounts;

    mapping (uint256 => TestRequest) testRequests;
    Counters.Counter _testIdTracker;
    mapping (address => uint256[]) requestIdsPerIssuer;

    mapping (uint256 => Certificate) certificates;
    uint256[] certificateIds;
    mapping (address => uint256[]) certificateIdsPerIssuer;
}

contract IPCRFacet {
    PCRPassStorage internal s;

    modifier onlyAdmin {
//        LibDiamond.enforceIsContractOwner();
        require(isAdmin(msg.sender), "Only admin can call this function");
        _;
    }

    modifier onlyAdminOrIssuer {
        require(isAdmin(msg.sender) || isIssuer(msg.sender), "Only admin or issuer can call this function");
        _;
    }

    function isAdmin(address _who) internal view returns (bool) {
        return _who == LibDiamond.contractOwner();
    }

    function isOrganization(address _who) internal view returns (bool) {
        return s.organizations[_who].name != "";
    }

    function isIssuer(address _who) internal view returns (bool) {
        if (isOrganization(_who)) {
            return s.organizations[_who].role ==  OrganizationRole.Issuer;
        }
        return false;
    }

    function isBusinessRole(address _who) internal view returns (bool) {
        if (isOrganization(_who)) {
            return s.organizations[_who].role ==  OrganizationRole.Business;
        }
        return false;
    }

    function isAdminOrOrganization(address _who) internal view returns (bool) {
        return isAdmin(_who) || isOrganization(_who);
    }

    function isSelf(address _who) internal view returns (bool) {
        return msg.sender == _who;
    }
}

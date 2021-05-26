// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

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
    uint256 testId;
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

contract PCRStorage is AccessControl {
    using Counters for Counters.Counter;

    mapping(address => Person) people;
    mapping(address => Organization) organizations;
    address[] organizationAccounts;

    mapping (uint256 => TestRequest) testRequests;
    Counters.Counter _testIdTracker;
    mapping (address => uint256[]) testIdsPerIssuer;

    mapping (uint256 => Certificate) certificates;
    uint256[] certificateIds;
    mapping (address => uint256[]) certificateIdsPerIssuer;

    event SetPerson(address who, bytes32 firstName, bytes32 lastName, bytes32 birth, Gender gender, uint[] residence, bytes32 phone, bytes32 mail, string photo);
    event SetOrganization(OrganizationRole role, address who, bytes32 name, bytes32 representative, uint[] streetAddress, bytes32 phone, bytes32 mail);
    event NewTestRequest(uint256 id, address user, address issuer, uint256 requestedAt);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin {
        require(isAdmin(msg.sender), "Only admin can call this function");
        _;
    }

    modifier onlyAdminOrIssuer {
        require(isAdmin(msg.sender) || isIssuer(msg.sender), "Only admin or issuer can call this function");
        _;
    }

    function isAdmin(address _who) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _who);
    }

    function isOrganization(address _who) public view returns (bool) {
        return organizations[_who].name != "";
    }

    function isIssuer(address _who) public view returns (bool) {
        if (isOrganization(_who)) {
            return organizations[_who].role ==  OrganizationRole.Issuer;
        }
        return false;
    }

    function isBusinessRole(address _who) public view returns (bool) {
        if (isOrganization(_who)) {
            return organizations[_who].role ==  OrganizationRole.Business;
        }
        return false;
    }

    function isAdminOrOrganization(address _who) public view returns (bool) {
        return isAdmin(_who) || isOrganization(_who);
    }

    function isSelf(address _who) public view returns (bool) {
        return msg.sender == _who;
    }

    function setAdmin(address _who) public onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, _who);
    }

    function getRoles(address _who) external view returns (bool, bool, bool) {
        require(isAdminOrOrganization(msg.sender) || isSelf(_who), "Only admin, organization or user self can call this function");

        return (isAdmin(_who), isIssuer(_who), isBusinessRole(_who));
    }

    function setPerson(address _who, bytes32 _firstName, bytes32 _lastName, bytes32 _birth, Gender _gender, uint[] memory _residence, bytes32 _phone, bytes32 _mail, string memory _photo) external onlyAdmin {
        people[_who].firstName = _firstName;
        people[_who].lastName = _lastName;
        people[_who].birth = _birth;
        people[_who].gender = _gender;
        people[_who].residence = _residence;
        people[_who].phone = _phone;
        people[_who].mail = _mail;
        people[_who].photo = _photo;

        emit SetPerson(_who, _firstName, _lastName, _birth, _gender, _residence, _phone, _mail, _photo);
    }

    function getPerson(address _who) external view returns (Person memory) {
        require(isAdminOrOrganization(msg.sender) || isSelf(_who), "Only admin, organization or user self can call this function");

        return people[_who];
    }

    function setOrganization(OrganizationRole _role, address _who, bytes32 _name, bytes32 _representative, uint[] memory _streetAddress, bytes32 _phone, bytes32 _mail) external onlyAdmin {
        if (organizations[_who].name == "" ) {
            organizationAccounts.push(_who);
        }

        organizations[_who].role = _role;
        organizations[_who].name = _name;
        organizations[_who].representative = _representative;
        organizations[_who].streetAddress = _streetAddress;
        organizations[_who].phone = _phone;
        organizations[_who].mail = _mail;

        emit SetOrganization(_role, _who, _name, _representative, _streetAddress, _phone, _mail);
    }

    function getOrganization(address _who) external view returns (Organization memory) {
        return organizations[_who];
    }

    function getOrganizations() external onlyAdmin view returns (address[] memory, Organization[] memory) {
        Organization[] memory _organizations = new Organization[](organizationAccounts.length);
        for (uint i = 0; i < organizationAccounts.length; i++) {
            _organizations[i] = organizations[organizationAccounts[i]];
        }
        return (organizationAccounts, _organizations);
    }

    function getTestRequest(uint256 _id) external onlyAdminOrIssuer view returns (TestRequest memory) {
        return testRequests[_id];
    }

    function getAllTestRequests() external onlyAdmin view returns (uint256[] memory, TestRequest[] memory) {
        uint256 _requestCount = _testIdTracker.current();
        uint256[] memory _ids = new uint256[](_requestCount);
        TestRequest[] memory _requests = new TestRequest[](_requestCount);
        for (uint i = 0; i < _requestCount; i++) {
            _ids[i] = i;
            _requests[i] = testRequests[i];
        }
        return (_ids, _requests);
    }

    function getTestRequestsByIssuer(address _who) external view returns (uint256[] memory, TestRequest[] memory) {
        require(isAdmin(msg.sender) || (isIssuer(msg.sender) && isSelf(_who)), "Only admin or issuer self can call this function");

        TestRequest[] memory _requests = new TestRequest[](testIdsPerIssuer[_who].length);
        for (uint i = 0; i < testIdsPerIssuer[_who].length; i++) {
            _requests[i] = testRequests[i];
        }
        return (testIdsPerIssuer[_who], _requests);
    }

    function getCertificate(uint256 _id) external view returns (Certificate memory){
        return certificates[_id];
    }

    function getAllCertificatesByIssuer(address _who) external view returns (uint256[] memory, Certificate[] memory){
        require(isAdmin(msg.sender) || (isIssuer(msg.sender) && isSelf(_who)), "Only admin or issuer self can call this function");

        uint256 _certificatesCount = certificateIdsPerIssuer[_who].length;
        Certificate[] memory _certificates = new Certificate[](_certificatesCount);
        for (uint i = 0; i < _certificatesCount; i++) {
            _certificates[i] = certificates[certificateIdsPerIssuer[_who][i]];
        }
        return (certificateIdsPerIssuer[_who], _certificates);
    }

    function getAllCertificates() external onlyAdmin view returns (uint256[] memory, Certificate[] memory){
        uint256[] memory _ids = new uint256[](certificateIds.length);
        Certificate[] memory _certificates = new Certificate[](certificateIds.length);
        for (uint i = 0; i < certificateIds.length; i++) {
            uint256 _id = certificateIds[i];
            _ids[i] = _id;
            _certificates[i] = certificates[_id];
        }
        return (_ids, _certificates);
    }

    function newTestRequest(address _user, address _issuer) external {
        require(!isBusinessRole(_issuer), "Account with business role can not call this function");
        uint256 _id = _testIdTracker.current();

        testRequests[_id].userAccount = _user;
        testRequests[_id].user = people[_user];
        testRequests[_id].issuerAccount = _issuer;
        testRequests[_id].issuer = organizations[_issuer];
        testRequests[_id].requestedAt = block.timestamp;
        testRequests[_id].issuedAt = 0;
        testIdsPerIssuer[_issuer].push(_id);

        _testIdTracker.increment();
        emit NewTestRequest(_id, _user, _issuer, block.timestamp);
    }

    function setCertificate(uint256 _testId, Certificate memory _certificate) public onlyAdmin {
        testRequests[_testId].issuedAt = block.timestamp;
        certificates[_testId] = _certificate;
        certificateIds.push(_testId);
        certificateIdsPerIssuer[testRequests[_testId].issuerAccount].push(_testId);
    }
}

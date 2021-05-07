// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol";

contract MedicalPCRCertificate is ERC721PresetMinterPauserAutoId {
    using Counters for Counters.Counter;

    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    enum Gender {Male, Female}
    enum TestResult {Negative, Positive}

    struct Person {
        bytes32 name;
        bytes32 birth;
        Gender gender;
        bytes32 residence;
        bytes32 phone;
        bytes32 mail;
    }

    struct Organization {
        bytes32 name;
        bytes32 representative;
        bytes32 streetAddress;
        bytes32 phone;
        bytes32 mail;
    }

    struct TestRequest {
        address account;
        bytes32 name;
        bytes32 birth;
        Gender gender;
        bytes32 residence;
        bytes32 phone;
        bytes32 mail;
        uint256 requestedAt;
        uint256 issuedAt;
    }

    struct Certificate {
        uint256 requestId;
        TestRequest request;
        address organizationAccount;
//        Organization organization;
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

    mapping(address => Person) people;
    mapping(address => Organization) public organizations;
    address[] organizationAccounts;

    mapping (uint256 => TestRequest) public testRequests;
    Counters.Counter private _testIdTracker;

    mapping (uint256 => Certificate) public certificates;
    uint256[] certificateIds;

    event SetPerson(address who, bytes32 name, bytes32 birth, Gender gender, bytes32 residence, bytes32 phone, bytes32 mail);
    event SetOrganization(address who, bytes32 name, bytes32 representative, bytes32 streetAddress, bytes32 phone, bytes32 mail);
    event NewTestRequest(uint256 id, address who, bytes32 name, bytes32 birth, Gender gender, bytes32 residence, bytes32 phone, bytes32 mail, uint256 requestedAt);

    constructor()
    	ERC721PresetMinterPauserAutoId(
            "MedicalPCRCertificate",
            "PCR",
            "https://ipfs.io/ipfs/"
        )
    {}

    function setPerson(address _who, bytes32 _name, bytes32 _birth, Gender _gender, bytes32 _residence, bytes32 _phone, bytes32 _mail) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only owner can set organization data.");

        people[_who].name = _name;
        people[_who].birth = _birth;
        people[_who].gender = _gender;
        people[_who].residence = _residence;
        people[_who].phone = _phone;
        people[_who].mail = _mail;

        emit SetPerson(_who, _name, _birth, _gender, _residence, _phone, _mail);
    }

    function setOrganization(address _who, bytes32 _name, bytes32 _representative, bytes32 _streetAddress, bytes32 _phone, bytes32 _mail) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only owner can set organization data.");

        if (organizations[_who].name == "" ) {
            organizationAccounts.push(_who);
        }

        organizations[_who].name = _name;
        organizations[_who].representative = _representative;
        organizations[_who].streetAddress = _streetAddress;
        organizations[_who].phone = _phone;
        organizations[_who].mail = _mail;
        _setupRole(ISSUER_ROLE, _who);

        emit SetOrganization(_who, _name, _representative, _streetAddress, _phone, _mail);
    }

    function getPerson(address _who) public view returns (Person memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender) || (msg.sender == _who), "Only owner, organization, or self can access personal data.");

        return people[_who];
    }

    function getOrganization(address _who) public view returns (Organization memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || (hasRole(ISSUER_ROLE, msg.sender) && (msg.sender == _who)), "Only owner or organization self can access organization data.");

        return organizations[_who];
    }

    function getOrganizations() public view returns (address[] memory, Organization[] memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only owner can access all organization data.");

        uint256 _organizationCount = organizationAccounts.length;
        Organization[] memory _organizations = new Organization[](_organizationCount);
        for (uint i = 0; i < _organizationCount; i++) {
            _organizations[i] = organizations[organizationAccounts[i]];
        }
        return (organizationAccounts, _organizations);
    }

    function getRoles(address _who) public view returns (bool, bool) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender) || (msg.sender == _who), "Only owner, organization, or self can access personal data.");

        bool isAdmin = hasRole(DEFAULT_ADMIN_ROLE, _who);
        bool isIssuer = hasRole(ISSUER_ROLE, _who);
        return (isAdmin, isIssuer);
    }

    function newTestRequest(address _who, bytes32 _name, bytes32 _birth, Gender _gender, bytes32 _residence, bytes32 _phone, bytes32 _mail) public {
        uint256 _id = _testIdTracker.current();

        testRequests[_id].account = _who;
        testRequests[_id].name = _name;
        testRequests[_id].birth = _birth;
        testRequests[_id].gender = _gender;
        testRequests[_id].residence = _residence;
        testRequests[_id].phone = _phone;
        testRequests[_id].mail = _mail;
        testRequests[_id].requestedAt = block.timestamp;
        testRequests[_id].issuedAt = 0;

        _testIdTracker.increment();
        emit NewTestRequest(_id, _who, _name, _birth, _gender, _residence, _phone, _mail, block.timestamp);
    }

    function getTestRequest(uint256 _id) public view returns (TestRequest memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Only owner or organization can access test request data.");

        return testRequests[_id];
    }

    function getTestRequests() public view returns (uint256[] memory, TestRequest[] memory) {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Only owner or organization can access test request data.");

        uint256 _requestCount = _testIdTracker.current();
        uint256[] memory _ids = new uint256[](_requestCount);
        TestRequest[] memory _requests = new TestRequest[](_requestCount);
        for (uint i = 0; i < _requestCount; i++) {
            _ids[i] = i;
            _requests[i] = testRequests[i];
        }
        return (_ids, _requests);
    }

    function mintCertificate(uint256 _requestId, address _organizationAccount, bytes32 _sampleId, bytes32 _sample, bytes32 _collectionMethod, bytes32 _collectionDate, bytes32 _testMethod, TestResult _result, bytes32 _resultDate, string memory _fileHash) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Owner or issuer can mint certificates.");

        TestRequest memory _testRequest = testRequests[_requestId];
        address _who = _testRequest.account;
        testRequests[_requestId].issuedAt = block.timestamp;

        certificates[_requestId] = Certificate({
            requestId: _requestId,
            request:_testRequest,
            organizationAccount: _organizationAccount,
//            organization: organizations[_organizationAccount],
            sampleId: _sampleId,
            sample: _sample,
            collectionMethod: _collectionMethod,
            collectionDate: _collectionDate,
            testMethod: _testMethod,
            result: _result,
            resultDate: _resultDate,
            fileHash: _fileHash,
            issuedAt: block.timestamp,
            expireAt: block.timestamp + 15 * 1 days
        });
        certificateIds.push(_requestId);

        _mint(_who, _requestId);
        _setTokenURI(_requestId, _fileHash);
    }

    function getCertificates(address _who) public view returns (uint256[] memory, Certificate[] memory){
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender) || (msg.sender == _who), "Only owner, organization, or self can access certificates of a person.");

        uint256 _certificatesCount = balanceOf(_who);
        uint256[] memory _ids = new uint256[](_certificatesCount);
        Certificate[] memory _certificates = new Certificate[](_certificatesCount);
        for (uint i = 0; i < _certificatesCount; i++) {
            uint256 _id = tokenOfOwnerByIndex(_who, i);
            _ids[i] = _id;
            _certificates[i] = certificates[_id];
        }
        return (_ids, _certificates);
    }

    function getAllCertificates() public view returns (uint256[] memory, Certificate[] memory){
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Only owner, organization can access all certificates.");

        uint256 _certificatesCount = certificateIds.length;
        uint256[] memory _ids = new uint256[](_certificatesCount);
        Certificate[] memory _certificates = new Certificate[](_certificatesCount);
        for (uint i = 0; i < _certificatesCount; i++) {
            uint256 _id = certificateIds[i];
            _ids[i] = _id;
            _certificates[i] = certificates[_id];
        }
        return (_ids, _certificates);
    }

    function getCertificate(uint256 _id) public view returns (Certificate memory){
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender) || (certificates[_id].request.account == msg.sender), "Only owner, organization, or self can access certificate.");
        return certificates[_id];
    }
}

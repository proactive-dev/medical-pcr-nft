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
        bytes32 name;
        bytes32 description;
        string fileHash;
        string imageHash;
        uint256 sampledAt;
        uint256 issuedAt;
        uint256 expireAt;
    }

    mapping(address => Person) people;
    mapping(address => Organization) public organizations;
    address[] organizationAccounts;

    mapping (uint256 => TestRequest) public testRequests;
    Counters.Counter private _testIdTracker;

    mapping (uint256 => Certificate) public certificates;
    Counters.Counter private _tokenIdTracker;

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

    function setPerson(bytes32 _name, bytes32 _birth, Gender _gender, bytes32 _residence, bytes32 _phone, bytes32 _mail) public {
        people[msg.sender].name = _name;
        people[msg.sender].birth = _birth;
        people[msg.sender].gender = _gender;
        people[msg.sender].residence = _residence;
        people[msg.sender].phone = _phone;
        people[msg.sender].mail = _mail;

        emit SetPerson(msg.sender, _name, _birth, _gender, _residence, _phone, _mail);
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

    function mint(address _who, bytes32 _name, bytes32 _description, string memory _fileHash, string memory _imageHash) public {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender), "Owner or issuer can mint certificates.");

        uint256 _id = _tokenIdTracker.current();
        _mint(_who, _id);
        _setTokenURI(_id, _fileHash);

        certificates[_id] = Certificate({
            name: _name,
            description: _description,
            fileHash: _fileHash,
            imageHash: _imageHash,
            sampledAt: 0,
            issuedAt: block.timestamp,
            expireAt: block.timestamp + 15 * 1 days
        });

        _tokenIdTracker.increment();
    }

    function getCertificates() public view returns (uint256[] memory, Certificate[] memory){
        uint256 certificatesCount = balanceOf(msg.sender);
        uint256[] memory _ids = new uint256[](certificatesCount);
        Certificate[] memory _certificates = new Certificate[](certificatesCount);
        for (uint i = 0; i < certificatesCount; i++) {
            uint256 _id = tokenOfOwnerByIndex(msg.sender, i);
            _ids[i] = _id;
            _certificates[i] = certificates[_id];
        }
        return (_ids, _certificates);
    }

    function getCertificate(uint256 id) public view returns (Certificate memory){
        return certificates[id];
    }

    function getCertificateByIndex(uint256 index) public view returns (uint256, Certificate memory){
        uint256 _id = tokenOfOwnerByIndex(msg.sender, index);
        return (_id, certificates[_id]);
    }
}

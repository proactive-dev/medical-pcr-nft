// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol";
import { IPCRFacet, TestResult, Certificate } from "./PCRPassStorage.sol";

contract PCRCertificateFacet is IPCRFacet, ERC721PresetMinterPauserAutoId {
    using Counters for Counters.Counter;

    constructor()
    ERC721PresetMinterPauserAutoId(
        "PCRCertificate",
        "PCR",
        "https://ipfs.io/ipfs/"
    )
    {}

    function mintCertificate(uint256 _requestId, bytes32 _sampleId, bytes32 _sample, bytes32 _collectionMethod, bytes32 _collectionDate, bytes32 _testMethod, TestResult _result, bytes32 _resultDate, string memory _fileHash) external onlyAdminOrIssuer {
        require(_result == TestResult.Negative, "Test result should be negative for a new certificate");

        address _who = s.testRequests[_requestId].userAccount;
        s.testRequests[_requestId].issuedAt = block.timestamp;

        s.certificates[_requestId] = Certificate({
            requestId: _requestId,
            request: s.testRequests[_requestId],
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
        s.certificateIds.push(_requestId);
        s.certificateIdsPerIssuer[s.testRequests[_requestId].issuerAccount].push(_requestId);

        _mint(_who, _requestId);
        _setTokenURI(_requestId, _fileHash);
    }

    function getCertificate(uint256 _id) external view returns (Certificate memory){
        return s.certificates[_id];
    }

    function getCertificates(address _who) external view returns (uint256[] memory, Certificate[] memory){
        require(isAdminOrOrganization(msg.sender) || isSelf(_who), "Only admin, organization or user self can call this function");

        uint256[] memory _ids = new uint256[](balanceOf(_who));
        Certificate[] memory _certificates = new Certificate[](balanceOf(_who));
        for (uint i = 0; i < balanceOf(_who); i++) {
            uint256 _id = tokenOfOwnerByIndex(_who, i);
            _ids[i] = _id;
            _certificates[i] = s.certificates[_id];
        }
        return (_ids, _certificates);
    }

    function getAllCertificatesByIssuer(address _who) external view returns (uint256[] memory, Certificate[] memory){
        require(isAdmin(msg.sender) || (isIssuer(msg.sender) && isSelf(_who)), "Only admin or issuer self can call this function");

        uint256 _certificatesCount = s.certificateIdsPerIssuer[_who].length;
        Certificate[] memory _certificates = new Certificate[](_certificatesCount);
        for (uint i = 0; i < _certificatesCount; i++) {
            _certificates[i] = s.certificates[s.certificateIdsPerIssuer[_who][i]];
        }
        return (s.certificateIdsPerIssuer[_who], _certificates);
    }

    function getAllCertificates() external onlyAdmin view returns (uint256[] memory, Certificate[] memory){
        uint256[] memory _ids = new uint256[](s.certificateIds.length);
        Certificate[] memory _certificates = new Certificate[](s.certificateIds.length);
        for (uint i = 0; i < s.certificateIds.length; i++) {
            uint256 _id = s.certificateIds[i];
            _ids[i] = _id;
            _certificates[i] = s.certificates[_id];
        }
        return (_ids, _certificates);
    }
}

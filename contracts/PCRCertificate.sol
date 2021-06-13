// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/presets/ERC721PresetMinterPauserAutoId.sol";
import { PCRStorage, TestRequest, TestResult, Certificate } from "./PCRStorage.sol";

contract PCRCertificate is ERC721PresetMinterPauserAutoId {
    using Counters for Counters.Counter;

    PCRStorage st;

    constructor()
    ERC721PresetMinterPauserAutoId(
        "PCRCertificate",
        "PCR",
        "https://ipfs.io/ipfs/"
    )
    {}

    function setStorage(address _who) public {
        st = PCRStorage(_who);
    }

    function mintCertificate(uint256 _testId, TestResult _result, string memory _fileHash) external {
        require(st.isAdmin(msg.sender) || st.isIssuer(msg.sender), "Only admin or issuer can call this function");
        require(_result == TestResult.Negative, "Test result should be negative for a new certificate");

        TestRequest memory _request = st.getTestRequest(_testId);
        address _who = _request.userAccount;

        Certificate memory _certificate = Certificate({
            testId: _testId,
            request: _request,
            result: _result,
            resultDate: block.timestamp,
            fileHash: _fileHash,
            issuedAt: block.timestamp,
            expireAt: block.timestamp + 15 * 1 days
        });
        st.setCertificate(_testId, _certificate);

        _mint(_who, _testId);
        _setTokenURI(_testId, _fileHash);
    }

    function getCertificates(address _who) external view returns (uint256[] memory, Certificate[] memory) {
        require(st.isAdminOrOrganization(msg.sender) || st.isSelf(_who), "Only admin, organization or user self can call this function");

        uint256[] memory _ids = new uint256[](balanceOf(_who));
        Certificate[] memory _certificates = new Certificate[](balanceOf(_who));
        for (uint i = 0; i < balanceOf(_who); i++) {
            uint256 _id = tokenOfOwnerByIndex(_who, i);
            _ids[i] = _id;
            _certificates[i] = st.getCertificate(_id);
        }
        return (_ids, _certificates);
    }
}

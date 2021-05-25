// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/Counters.sol";
import { IPCRFacet, TestRequest } from "./PCRPassStorage.sol";

contract PCRRequestFacet is IPCRFacet {
    using Counters for Counters.Counter;

    event NewTestRequest(uint256 id, address user, address issuer, uint256 requestedAt);

    function newTestRequest(address _user, address _issuer) external {
        require(!isBusinessRole(_issuer), "Account with business role can not call this function");
        uint256 _id = s._testIdTracker.current();

        s.testRequests[_id].userAccount = _user;
        s.testRequests[_id].user = s.people[_user];
        s.testRequests[_id].issuerAccount = _issuer;
        s.testRequests[_id].issuer = s.organizations[_issuer];
        s.testRequests[_id].requestedAt = block.timestamp;
        s.testRequests[_id].issuedAt = 0;
        s.requestIdsPerIssuer[_issuer].push(_id);

        s._testIdTracker.increment();
        emit NewTestRequest(_id, _user, _issuer, block.timestamp);
    }

    function getTestRequest(uint256 _id) external onlyAdminOrIssuer view returns (TestRequest memory) {
        return s.testRequests[_id];
    }

    function getAllTestRequests() external onlyAdmin view returns (uint256[] memory, TestRequest[] memory) {
        uint256 _requestCount = s._testIdTracker.current();
        uint256[] memory _ids = new uint256[](_requestCount);
        TestRequest[] memory _requests = new TestRequest[](_requestCount);
        for (uint i = 0; i < _requestCount; i++) {
            _ids[i] = i;
            _requests[i] = s.testRequests[i];
        }
        return (_ids, _requests);
    }

    function getTestRequestsByIssuer(address _who) external view returns (uint256[] memory, TestRequest[] memory) {
        require(isAdmin(msg.sender) || (isIssuer(msg.sender) && isSelf(_who)), "Only admin or issuer self can call this function");

        TestRequest[] memory _requests = new TestRequest[](s.requestIdsPerIssuer[_who].length);
        for (uint i = 0; i < s.requestIdsPerIssuer[_who].length; i++) {
            _requests[i] = s.testRequests[i];
        }
        return (s.requestIdsPerIssuer[_who], _requests);
    }
}

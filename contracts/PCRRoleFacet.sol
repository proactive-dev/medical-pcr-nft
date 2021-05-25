// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { IPCRFacet } from "./PCRPassStorage.sol";

contract PCRRoleFacet is IPCRFacet {
    function getRoles(address _who) external view returns (bool, bool, bool) {
        require(isAdminOrOrganization(msg.sender) || isSelf(_who), "Only admin, organization or user self can call this function");

        return (isAdmin(_who), isIssuer(_who), isBusinessRole(_who));
    }
}

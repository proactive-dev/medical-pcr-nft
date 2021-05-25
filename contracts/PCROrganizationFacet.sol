// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { IPCRFacet, OrganizationRole, Organization } from "./PCRPassStorage.sol";

contract PCROrganizationFacet is IPCRFacet {
    event SetOrganization(OrganizationRole role, address who, bytes32 name, bytes32 representative, uint[] streetAddress, bytes32 phone, bytes32 mail);

    function setOrganization(OrganizationRole _role, address _who, bytes32 _name, bytes32 _representative, uint[] memory _streetAddress, bytes32 _phone, bytes32 _mail) external onlyAdmin {
        if (s.organizations[_who].name == "" ) {
            s.organizationAccounts.push(_who);
        }

        s.organizations[_who].role = _role;
        s.organizations[_who].name = _name;
        s.organizations[_who].representative = _representative;
        s.organizations[_who].streetAddress = _streetAddress;
        s.organizations[_who].phone = _phone;
        s.organizations[_who].mail = _mail;

        emit SetOrganization(_role, _who, _name, _representative, _streetAddress, _phone, _mail);
    }

    function getOrganization(address _who) external view returns (Organization memory) {
        return s.organizations[_who];
    }

    function getOrganizations() external onlyAdmin view returns (address[] memory, Organization[] memory) {
        Organization[] memory _organizations = new Organization[](s.organizationAccounts.length);
        for (uint i = 0; i < s.organizationAccounts.length; i++) {
            _organizations[i] = s.organizations[s.organizationAccounts[i]];
        }
        return (s.organizationAccounts, _organizations);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import { IPCRFacet, Gender, Person } from "./PCRPassStorage.sol";

contract PCRUserFacet is IPCRFacet {
    event SetPerson(address who, bytes32 firstName, bytes32 lastName, bytes32 birth, Gender gender, uint[] residence, bytes32 phone, bytes32 mail, string photo);

    function setPerson(address _who, bytes32 _firstName, bytes32 _lastName, bytes32 _birth, Gender _gender, uint[] memory _residence, bytes32 _phone, bytes32 _mail, string memory _photo) external onlyAdmin {
        s.people[_who].firstName = _firstName;
        s.people[_who].lastName = _lastName;
        s.people[_who].birth = _birth;
        s.people[_who].gender = _gender;
        s.people[_who].residence = _residence;
        s.people[_who].phone = _phone;
        s.people[_who].mail = _mail;
        s.people[_who].photo = _photo;

        emit SetPerson(_who, _firstName, _lastName, _birth, _gender, _residence, _phone, _mail, _photo);
    }

    function getPerson(address _who) external view returns (Person memory) {
        require(isAdminOrOrganization(msg.sender) || isSelf(_who), "Only admin, organization or user self can call this function");

        return s.people[_who];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FastDomainNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string nftURI =
        "https://ipfs.io/ipfs/Qma1YsBMguqxHGJege2oeym6eKUVqFuD7u3W958DKxPPvQ";

    address public fastDomain;

    constructor() ERC721("FastDomainNFT", "FSTNFT") {}

    function awardUser(address user) external returns (uint256) {
        require(msg.sender == fastDomain, "Unauthorized user");
        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);
        _setTokenURI(newItemId, nftURI);

        _tokenIds.increment();
        return newItemId;
    }

    function setFastDomain(address _fastDomain) public onlyOwner {
        fastDomain = _fastDomain;
    }
}
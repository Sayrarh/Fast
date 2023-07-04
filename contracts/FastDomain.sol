// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC20 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool);

    function transfer(address _to, uint256 _amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface IFastDomainNFT {
    function awardUser(address user) external returns (uint256);
}

contract FastDomain {
    ///////////////// EVENTS ///////////////

    /**
     * @dev Emitted when a domain is registered.
     * @param domain The registered domain name.
     * @param user The user who registered the domain.
     */
    event DomainEvent(string domain, address user);

    /////////////// STATE ///////////////

    IERC20 tokenAddr; // Address of the ERC20 token contract used for transactions within the FastDomain DApp.
    IFastDomainNFT nftAddr;
    mapping(address => string) userNames; // Associates user addresses with their registered domain names.
    mapping(string => bool) registeredDomainUsers; // Keeps track of registered domain names and their ownership status.
    mapping(address => bool) registered; // Keeps track of whether an address has already registered a domain or not.
    mapping(address => uint256) userDomains; // Mapping to track the index of each user's domain name.
    mapping(address => bool) hasMinted; // Keeps track of whether an address has already minted tokens or not.
    mapping(address => uint256) userNFTId;

    string[] AllRegisteredDomains;

    uint256 amountToMint = 2 * 10 ** 18;

    /////////////// ERROR MESSAGES ///////////////

    error ZeroAddress();
    error DomainExists();
    error GetToken();
    error HasAlreadyMinted();
    error InsufficientToken();
    error NotOwner();
    error AddressDontHaveFastDomain();

    /////////////// CONSTRUCTOR ///////////////

    /**
     * @dev Initializes the FastDomain contract.
     * @param _fastTokenAddress The address of the ERC20 token contract used for transactions.
     * @param _nftAddr The address of the FastDomain NFT contract for awarding NFTs.
     */
    constructor(IERC20 _fastTokenAddress, IFastDomainNFT _nftAddr) {
        tokenAddr = _fastTokenAddress;
        nftAddr = _nftAddr;
    }

    /////////////// MODIFIERS ///////////////

    /**
     * @dev Modifier to check if the caller is the owner of the specified domain.
     * @param user The user address to check ownership for.
     */
    modifier onlyOwner(address user) {
        require(msg.sender == user, "NotOwner");
        _;
    }

    /////////////// FUNCTIONALITY ///////////////

    /**
     * @dev Mint tokens for testing purposes.
     * @return A string indicating the success of token minting.
     */
    function mintToken() external returns (string memory) {
        if (hasMinted[msg.sender] == true) {
            revert HasAlreadyMinted();
        }

        if (IERC20(tokenAddr).balanceOf(address(this)) < amountToMint) {
            revert InsufficientToken();
        }

        hasMinted[msg.sender] = true;
        IERC20(tokenAddr).transfer(msg.sender, amountToMint);

        return "Fast Token Successfully Minted";
    }

    /**
     * @dev Register a domain by specifying a domain name.
     * @param _domain The domain name to register.
     */
    function registerFastDomain(string memory _domain) external {
        if (IERC20(tokenAddr).balanceOf(msg.sender) < amountToMint) {
            revert GetToken();
        }
        if (registeredDomainUsers[_domain] == true) {
            revert DomainExists();
        }

        if (registered[msg.sender] == true) {
            revert("Address has a domain!, update domain");
        }

        IERC20(tokenAddr).transferFrom(msg.sender, address(this), 1e18);

        userNames[msg.sender] = _domain;
        registeredDomainUsers[_domain] = true;
        registered[msg.sender] = true;
        // Mint NFT and get the token ID
        uint256 nftId = nftAddr.awardUser(msg.sender);
        userNFTId[msg.sender] = nftId;

        AllRegisteredDomains.push(_domain);
        userDomains[msg.sender] = AllRegisteredDomains.length - 1; // Store the index of the domain name

        emit DomainEvent(_domain, msg.sender);
    }

    /**
     * @dev Reassign the domain to a new domain name.
     * @param _newDomain The new domain name to assign.
     * @param user The owner of the domain.
     */
    function reassignDomain(string memory _newDomain, address user) external onlyOwner(user) {
        if (IERC20(tokenAddr).balanceOf(msg.sender) >= amountToMint) {
            revert GetToken();
        }

        // Check that the user is registered
        if (registered[user] == false) {
            revert AddressDontHaveFastDomain();
        }

        if (registeredDomainUsers[_newDomain] == true) {
            revert DomainExists();
        }

        if (user == address(0)) {
            revert ZeroAddress();
        }

        IERC20(tokenAddr).transferFrom(msg.sender, address(this), 1e18);

        string memory oldDomain = userNames[user];
        registeredDomainUsers[oldDomain] = false;

        // Update the AllRegisteredDomains array using the stored index
        uint256 domainIndex = userDomains[user];
        AllRegisteredDomains[domainIndex] = _newDomain;

        userNames[user] = _newDomain;
        registeredDomainUsers[_newDomain] = true;

        emit DomainEvent(_newDomain, msg.sender);
    }

    /**
     * @dev Retrieve the domain name associated with a given address.
     * @param _domainAddress The address to retrieve the domain for.
     * @return The domain name associated with the given address.
     */
    function getDomain(address _domainAddress) external view returns (string memory) {
        return userNames[_domainAddress];
    }

    /**
     * @dev Check if a domain name is already registered.
     * @param domain The domain name to check.
     * @return A boolean indicating whether the domain is registered or not.
     */
    function isDomainRegistered(string memory domain) external view returns (bool) {
        return registeredDomainUsers[domain];
    }

    /**
     * @dev Get an array containing all registered domain names.
     * @return An array of registered domain names.
     */
    function getAllregisteredDomains() external view returns (string[] memory) {
        return AllRegisteredDomains;
    }

    /**
     * @dev Transfer ownership of a domain to another address.
     * @param _newOwner The address of the new owner.
     * @param user The current owner of the domain.
     */
    function transferDomainOwnership(address _newOwner, address user) external onlyOwner(user) {
        if (registered[user] == false) {
            revert AddressDontHaveFastDomain();
        }

        registered[user] = false;
        registered[_newOwner] = true;

        emit DomainEvent(userNames[user], _newOwner);
    }
}

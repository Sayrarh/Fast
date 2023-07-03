//SPDX-License-Identifier: MIT
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

/**

@title FastDomain
@dev A smart contract for registering and managing domain names within the FastDomain DApp.
*/
contract FastDomain {
      /**
      * @dev Emitted when a domain is registered.
      * @param domain The domain name that is registered.
      * @param user The address of the user who registered the domain.
      * @param timestamp The timestamp of the registration.
      * @param blockNumber The block number of the registration.
      */
     event DomainRegistered(string domain, address indexed user, uint256 timestamp, uint256 blockNumber);

    /**
    * @dev Emitted when a domain is reassigned.
    * @param oldDomain The old domain name that is being reassigned.
    * @param newDomain The new domain name to which the domain is being reassigned.
    * @param user The address of the user who owns the domain.
    * @param timestamp The timestamp of the reassignment.
    * @param blockNumber The block number of the reassignment.
    */

    event DomainReassigned(string oldDomain, string newDomain, address indexed user, uint256 timestamp, uint256 blockNumber);

    ////////////////STATE//////////////////
    IERC20 tokenAddr; //address of the ERC20 token contract used for transactions within the FastDomain DApp.
    IFastDomainNFT nftAddr;
    mapping(address => string) userNames; //associates user addresses with their registered domain names.
    mapping(string => bool) registeredDomainUsers; //keeps track of registered domain names and their ownership status.
    mapping(address => bool) registered; //keeps track of whether an address has already registered a domain or not.
    mapping(address => uint256) userDomains; // new mapping to track the index of each user's domain name
    mapping(address => bool) hasMinted; //keeps track of whether an address has already minted tokens or not.
    mapping(address => uint256) userNFTId;

    string[] AllRegisteredDomains;

    uint256 amountToMint = 2 * 10 ** 18;

    /**
    * @dev Modifier to check if a domain name is not already registered.
    * @param domain The domain name to check.
    */
    modifier onlyNotRegistered(string memory domain) {
    require(!registeredDomainUsers[domain], "DomainExists");
    _;
    }


    /**
    * @dev Modifier to check if a domain name is not empty.
    * @param domain The domain name to check.
    */
    modifier requireDomainNotEmpty(string memory domain) {
        require(bytes(domain).length > 0, "EmptyDomain");
        _;
    }

    /**
    @dev Constructor function for the FastDomain contract.
    @param _fastTokenAddress The address of the ERC20 token contract used for transactions within the FastDomain DApp.
    @param _nftAddr The address of the IFastDomainNFT contract used for NFT minting.
    */
    constructor(IERC20 _fastTokenAddress, IFastDomainNFT _nftAddr) {
        tokenAddr = _fastTokenAddress;
        nftAddr = _nftAddr;
    }

    /**
    * @dev Allows users to mint tokens for testing purposes.
    * @return A string indicating the success of token minting.
    */
    function mintToken() external returns (string memory) {
        require(!hasMinted[msg.sender], "HasAlreadyMinted");
        require(IERC20(tokenAddr).balanceOf(address(this)) >= amountToMint, "InsufficientToken");
        hasMinted[msg.sender] = true;
        IERC20(tokenAddr).transfer(msg.sender, amountToMint);
        return "Fast Token Successfully Minted";
    }

    /**
    * @dev Enables users to register a domain by specifying a domain name.
    * @param _domain The domain name to be registered.
    */
    function registerFastDomain(string memory _domain)  external requireDomainNotEmpty(_domain) onlyNotRegistered(_domain) {
        require(IERC20(tokenAddr).balanceOf(msg.sender) >= amountToMint,"GetToken");
        require(!registered[msg.sender], "Address has a domain!, update domain");

        IERC20(tokenAddr).transferFrom(msg.sender, address(this), 1e18);

        userNames[msg.sender] = _domain;
        registeredDomainUsers[_domain] = true;
        registered[msg.sender] = true;
        // Mint NFT and get the token ID
        uint256 nftId = nftAddr.awardUser(msg.sender);
        userNFTId[msg.sender] = nftId;

        AllRegisteredDomains.push(_domain);
        userDomains[msg.sender] = AllRegisteredDomains.length - 1; // store the index of the domain name

        emit DomainRegistered(_domain, msg.sender, block.timestamp, block.number);
    }


     /**
     * @dev Allows the owner of a domain to reassign it to a new domain name.
     * @param _newDomain The new domain name to which the domain is being reassigned.
     * @param user The address of the user who owns the domain.
     */
    function reassignDomain(string memory _newDomain, address user) external requireDomainNotEmpty(_newDomain) onlyNotRegistered(_newDomain) {
        require(msg.sender == user, "NotOwner");
        require(IERC20(tokenAddr).balanceOf(msg.sender) >= amountToMint,"GetToken");
        require(registered[user], "AddressDontHaveFastDomain");
        require(user != address(0), "ZeroAddress");

        IERC20(tokenAddr).transferFrom(msg.sender, address(this), 1e18);

        string memory oldDomain = userNames[user];
        registeredDomainUsers[oldDomain] = false;

        // update the AllRegisteredNames array using the stored index
        uint domainIndex = userDomains[user];
        AllRegisteredDomains[domainIndex] = _newDomain;

        userNames[user] = _newDomain;
        registeredDomainUsers[_newDomain] = true;

        emit DomainReassigned(oldDomain, _newDomain, msg.sender, block.timestamp, block.number);
    }

    /**
    * @dev Retrieves the domain name associated with a given address.
    * @param _domainAddress The address for which to retrieve the domain name.
    * @return The domain name associated with the address.
    */
    function getDomain(
        address _domainAddress
    ) external view returns (string memory) {
      require(_domainAddress != address(0), "ZeroAddress");
        return userNames[_domainAddress];
    }

    /**
    * @dev Checks if a domain name is already registered.
    * @param domain The domain name to check.
    * @return A boolean indicating whether the domain name is registered.
    */
    function isDomainRegistered(
        string memory domain
    ) external requireDomainNotEmpty(domain) view returns (bool) {
        return registeredDomainUsers[domain];
    }

    /**
    * @dev Returns an array containing all registered domain names.
    * @return An array of strings representing the registered domain names.
    */
    function getAllregisteredDomains() external view returns (string[] memory) {
        return AllRegisteredDomains;
    }
}

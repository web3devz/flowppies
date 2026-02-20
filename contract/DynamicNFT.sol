// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Pausable,
    Ownable
{
   
    address constant public cadenceArch = 0x0000000000000000000000010000000000000001;
    uint256 public constant BATTLE_DURATION = 30; // 5 minutes for staking
    event PetEvolved(uint256 indexed tokenId, uint64 bonus);

    uint256 private _nextTokenId;

    // user => tokenId => uri
    mapping(address => mapping(uint256 => string)) public userTokenURI;

    // tokenId => owner (for easy querying)
    mapping(uint256 => address) public tokenIdToMinter;

    //tokenId => multiplier
    mapping(uint256 => uint256) public tokenIdToMultiplier;

    //tokenId => level
    mapping(uint256 => uint256) public tokenIdToLevel;

    // user => tokenId => multiplier (fixed-point, scaled by 1e18)
    mapping(address => mapping(uint256 => uint256)) public userTokenMultiplier;

    // Battle System State Variables
    struct Battle {
        uint256 pet1;
        uint256 pet2;
        address creator;
        bool active;
        uint256 totalStakePet1;
        uint256 totalStakePet2;
        mapping(address => uint256) stakesPet1;
        mapping(address => uint256) stakesPet2;
        uint256 winner; // 0 if no winner yet, petId of winner otherwise
        uint256 createdAt;
    }

    uint256 public battleCount;
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => address[]) public battleStakersPet1; // Track stakers for reward distribution
    mapping(uint256 => address[]) public battleStakersPet2;

    uint256 public constant MAX_STAKE_AMOUNT = 20 ether; // Cap on stake amount
    address public platformVault;

    // Events
    event Minted(address indexed user, uint256 indexed tokenId, string uid);
    event BattleCreated(uint256 indexed battleId, uint256 pet1, uint256 pet2, address creator);
    event Staked(uint256 indexed battleId, uint256 petId, address staker, uint256 amount);
    event BattleEnded(uint256 indexed battleId, uint256 winner);
    event RewardsDistributed(uint256 indexed battleId, uint256 totalRewards);

    constructor(address initialOwner)
        ERC721("Flow-Project", "FHP")
        Ownable(initialOwner)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    
    function safeMint(string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        userTokenURI[msg.sender][tokenId] = uri;
        tokenIdToMinter[tokenId] = msg.sender;
        userTokenMultiplier[msg.sender][tokenId] = 1e18;
        tokenIdToMultiplier[tokenId] = 1e18;
        tokenIdToLevel[tokenId] = 1e18;
        emit Minted(msg.sender, tokenId, uri);
        return tokenId;
    }

  
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) public {
        require(tokenIdToMinter[tokenId] == msg.sender, "Not authorized");
        _setTokenURI(tokenId, newTokenURI);
    }

    function showTokenURI(uint256 tokenId) public view returns (string memory) {
        return super.tokenURI(tokenId);
    }

    
    function getUserURI(address user, uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return userTokenURI[user][tokenId];
    }

   
    function getMinter(uint256 tokenId) public view returns (address) {
        return tokenIdToMinter[tokenId];
    }

    
    function feed(uint256 tokenId) public payable {
        require(msg.value >= 0.01 ether, "Feed requires 0.01 ether fee");
        tokenIdToMultiplier[tokenId] += 1e17; // +0.1
    }

    
    function train(uint256 tokenId) public payable {
        require(msg.value >= 0.02 ether, "Train requires 0.02 ether fee");
        tokenIdToMultiplier[tokenId] += 15e16; // +0.15
    }

    function levelUp(uint256 tokenId) public {
        require(tokenIdToMinter[tokenId] == msg.sender, "Not authorized");
        tokenIdToLevel[tokenId] += 1e18;
        tokenIdToMultiplier[tokenId] += 50e16;
    }

    // Battle System Functions

   
    function setPlatformVault(address _vault) external onlyOwner {
        platformVault = _vault;
    }

   
    function createBattle(uint256 pet1, uint256 pet2) external returns (uint256) {
        require(_ownerOf(pet1) != address(0) && _ownerOf(pet2) != address(0), "Pets must exist");
        require(pet1 != pet2, "Cannot battle same pet");
        require(tokenIdToMinter[pet1] == msg.sender || tokenIdToMinter[pet2] == msg.sender, "Must be creator of at least one pet");

        // battleCount++;
        Battle storage b = battles[battleCount];
        battleCount++;
        b.pet1 = pet1;
        b.pet2 = pet2;
        b.creator = msg.sender;
        b.active = true;
        b.winner = 0;
        b.createdAt = block.timestamp;

        emit BattleCreated(battleCount, pet1, pet2, msg.sender);
        return battleCount;
    }

    
function stake(uint256 battleId, uint256 petId) external payable {
    Battle storage b = battles[battleId];
    require(b.active, "Battle not active");
    require(petId == b.pet1 || petId == b.pet2, "Pet not in battle");
    require(msg.value > 0, "Stake amount must be greater than 0");

    uint256 currentUserStake;
    if (petId == b.pet1) {
        currentUserStake = b.stakesPet1[msg.sender];
    } else {
        currentUserStake = b.stakesPet2[msg.sender];
    }

    // Check if total stake (current + new) would exceed limit
    require(currentUserStake + msg.value <= MAX_STAKE_AMOUNT, "Total stake exceeds maximum allowed");

    if (petId == b.pet1) {
        if (b.stakesPet1[msg.sender] == 0) {
            battleStakersPet1[battleId].push(msg.sender);
        }
        b.stakesPet1[msg.sender] += msg.value;
        b.totalStakePet1 += msg.value;
    } else {
        if (b.stakesPet2[msg.sender] == 0) {
            battleStakersPet2[battleId].push(msg.sender);
        }
        b.stakesPet2[msg.sender] += msg.value;
        b.totalStakePet2 += msg.value;
    }

    emit Staked(battleId, petId, msg.sender, msg.value);
}


    
    // function declareWinner(uint256 battleId, uint256 winnerPetId) external onlyOwner {
    //     Battle storage b = battles[battleId];
    //     require(b.active, "Battle not active");
    //     require(winnerPetId == b.pet1 || winnerPetId == b.pet2, "Winner must be one of the battling pets");

    //     b.active = false;
    //     b.winner = winnerPetId;

    //     uint256 totalPool = b.totalStakePet1 + b.totalStakePet2;
    //     if (totalPool == 0) {
    //         emit BattleEnded(battleId, winnerPetId);
    //         return;
    //     }

    //     uint256 creatorShare = (totalPool * 30) / 100;
    //     uint256 platformShare = (totalPool * 10) / 100;
    //     uint256 stakersShare = totalPool - creatorShare - platformShare;

    //     // Transfer creator share
    //     address winnerCreator = tokenIdToMinter[winnerPetId];
    //     payable(winnerCreator).transfer(creatorShare);

    //     // Transfer platform share
    //     if (platformVault != address(0)) {
    //         payable(platformVault).transfer(platformShare);
    //     } else {
    //         payable(owner()).transfer(platformShare);
    //     }

    //     // Distribute rewards to winning stakers
    //     uint256 totalWinnerStake = winnerPetId == b.pet1 ? b.totalStakePet1 : b.totalStakePet2;
        
    //     if (totalWinnerStake > 0) {
    //         address[] memory winners = winnerPetId == b.pet1 ? battleStakersPet1[battleId] : battleStakersPet2[battleId];
            
    //         for (uint256 i = 0; i < winners.length; i++) {
    //             address staker = winners[i];
    //             uint256 stakerAmount = winnerPetId == b.pet1 ? b.stakesPet1[staker] : b.stakesPet2[staker];
                
    //             if (stakerAmount > 0) {
    //                 uint256 reward = (stakersShare * stakerAmount) / totalWinnerStake;
    //                 payable(staker).transfer(reward);
    //             }
    //         }
    //     }

    //     emit BattleEnded(battleId, winnerPetId);
    //     emit RewardsDistributed(battleId, totalPool);
    // }


function _distributeRewards(uint256 battleId, uint256 winnerPetId) internal {
    Battle storage b = battles[battleId];
    b.active = false;
    b.winner = winnerPetId;

    uint256 totalPool = b.totalStakePet1 + b.totalStakePet2;
    if (totalPool == 0) {
        return;
    }

    uint256 creatorShare = (totalPool * 30) / 100;
    uint256 platformShare = (totalPool * 10) / 100;
    uint256 stakersShare = totalPool - creatorShare - platformShare;

    // Transfer creator share
    address winnerCreator = tokenIdToMinter[winnerPetId];
    payable(winnerCreator).transfer(creatorShare);

    // Transfer platform share
    if (platformVault != address(0)) {
        payable(platformVault).transfer(platformShare);
    } else {
        payable(owner()).transfer(platformShare);
    }

    // Distribute rewards to winning stakers using getBattleStakers function
    uint256 totalWinnerStake = winnerPetId == b.pet1 ? b.totalStakePet1 : b.totalStakePet2;
    
    if (totalWinnerStake > 0) {
        // Use getBattleStakers function to get the correct stakers array
        address[] memory winners = this.getBattleStakers(battleId, winnerPetId);
        
        for (uint256 i = 0; i < winners.length; i++) {
            address staker = winners[i];
            uint256 stakerAmount = winnerPetId == b.pet1 ? b.stakesPet1[staker] : b.stakesPet2[staker];
            
            if (stakerAmount > 0) {
                uint256 reward = (stakersShare * stakerAmount) / totalWinnerStake;
                payable(staker).transfer(reward);
            }
        }
    }

    emit RewardsDistributed(battleId, totalPool);
}


function resolveBattle(uint256 battleId) external {
    Battle storage b = battles[battleId];
    require(b.active, "Battle not active");
    require(msg.sender == b.creator, "Only battle creator can resolve");
    require(block.timestamp >= b.createdAt + BATTLE_DURATION, "Battle still accepting stakes");
    
    // Get random number from Flow's VRF
    (bool ok, bytes memory data) = cadenceArch.staticcall(abi.encodeWithSignature("revertibleRandom()"));
    require(ok, "Failed to fetch random number through Cadence Arch");
    uint64 randomNumber = abi.decode(data, (uint64));
    
    // Calculate battle outcome: 70% stats, 30% randomness
    uint256 pet1BaseStats = tokenIdToMultiplier[b.pet1];
    uint256 pet2BaseStats = tokenIdToMultiplier[b.pet2];
    
    // Add random factor (0-1000 range for each pet)
    uint256 pet1Power = pet1BaseStats + (randomNumber % 1000);
    uint256 pet2Power = pet2BaseStats + ((randomNumber / 1000) % 1000);
    
    uint256 winnerPetId = pet1Power > pet2Power ? b.pet1 : b.pet2;
    
    // Distribute rewards automatically
    _distributeRewards(battleId, winnerPetId);
    
    emit BattleEnded(battleId, winnerPetId);
}


    function getBattleDetails(uint256 battleId) external view returns (
        uint256 pet1,
        uint256 pet2,
        address creator,
        bool active,
        uint256 totalStakePet1,
        uint256 totalStakePet2,
        uint256 winner
    ) {
        Battle storage b = battles[battleId];
        return (b.pet1, b.pet2, b.creator, b.active, b.totalStakePet1, b.totalStakePet2, b.winner);
    }

    function getUserStake(uint256 battleId, uint256 petId, address user) external view returns (uint256) {
        Battle storage b = battles[battleId];
        if (petId == b.pet1) {
            return b.stakesPet1[user];
        } else if (petId == b.pet2) {
            return b.stakesPet2[user];
        }
        return 0;
    }

  
    function getBattleStakers(uint256 battleId, uint256 petId) external view returns (address[] memory) {
        Battle storage b = battles[battleId];
        if (petId == b.pet1) {
            return battleStakersPet1[battleId];
        } else if (petId == b.pet2) {
            return battleStakersPet2[battleId];
        }
        return new address[](0);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        if (platformVault != address(0)) {
            payable(platformVault).transfer(balance);
        } else {
            payable(owner()).transfer(balance);
        }
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    /**
 * @notice Evolve pet with random bonus using VRF
 */
function evolveWithRandomBonus(uint256 tokenId) public payable {
    require(tokenIdToMinter[tokenId] == msg.sender, "Not authorized");
    require(msg.value >= 0.05 ether, "Evolution requires 0.05 ether fee");
    
    // Get random number from Flow's VRF
    (bool ok, bytes memory data) = cadenceArch.staticcall(abi.encodeWithSignature("revertibleRandom()"));
    require(ok, "Failed to fetch random number through Cadence Arch");
    uint64 randomNumber = abi.decode(data, (uint64));
    
    // Random evolution bonus between 10-50%
    uint64 evolutionBonus = (randomNumber % 41) + 10; // 10-50 range
    tokenIdToMultiplier[tokenId] += evolutionBonus * 1e16;
    
    emit PetEvolved(tokenId, evolutionBonus);
}

}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EventContract
 * @dev High-throughput prediction market contract engineered for Somnia Network.
 * Supports decentralized event creation, staking on binary outcomes (YES/NO),
 * admin/oracle market resolution, and proportional reward distribution.
 */
contract EventContract {
    // Contract administrator / authorized oracle
    address public admin;

    // Total number of prediction events created
    uint256 public eventCount;

    // Structure defining an individual prediction event
    struct EventItem {
        uint256 id;
        string title;
        uint256 deadline;
        uint256 totalYesPool;
        uint256 totalNoPool;
        bool isResolved;
        bool outcome; // true = YES, false = NO
        address creator;
    }

    // Mapping from eventId => Event details
    mapping(uint256 => EventItem) public events;

    // Mapping from eventId => user address => staked amount on YES
    mapping(uint256 => mapping(address => uint256)) public yesStakes;

    // Mapping from eventId => user address => staked amount on NO
    mapping(uint256 => mapping(address => uint256)) public noStakes;

    // Mapping from eventId => user address => whether reward has been claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    // Mutex lock for Reentrancy protection
    bool private locked;

    // --- Events ---
    event EventCreated(
        uint256 indexed eventId,
        string title,
        uint256 deadline,
        address indexed creator
    );

    event PredictionPlaced(
        uint256 indexed eventId,
        address indexed predictor,
        bool choice,
        uint256 amount
    );

    event EventResolved(
        uint256 indexed eventId,
        bool outcome,
        uint256 totalYesPool,
        uint256 totalNoPool
    );

    event RewardClaimed(
        uint256 indexed eventId,
        address indexed predictor,
        uint256 rewardAmount
    );

    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "EventContract: Only admin/oracle can call this");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "EventContract: Reentrancy guard");
        locked = true;
        _;
        locked = false;
    }

    /**
     * @dev Sets deployer as the initial contract admin/oracle.
     */
    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Creates a new prediction market event.
     * @param title The question or headline for the prediction event.
     * @param deadline Unix timestamp after which predictions are closed and resolution begins.
     * @return eventId The newly generated event identifier.
     */
    function createEvent(
        string memory title,
        uint256 deadline
    ) external returns (uint256 eventId) {
        require(bytes(title).length > 0, "EventContract: Title cannot be empty");
        require(deadline > block.timestamp, "EventContract: Deadline must be in the future");

        eventId = ++eventCount;

        events[eventId] = EventItem({
            id: eventId,
            title: title,
            deadline: deadline,
            totalYesPool: 0,
            totalNoPool: 0,
            isResolved: false,
            outcome: false,
            creator: msg.sender
        });

        emit EventCreated(eventId, title, deadline, msg.sender);
    }

    /**
     * @notice Places a prediction on an active event by staking STT native tokens.
     * @param eventId The event identifier to predict on.
     * @param choice Prediction stance (true = YES, false = NO).
     */
    function placePrediction(
        uint256 eventId,
        bool choice
    ) external payable {
        require(msg.value > 0, "EventContract: Stake must be greater than 0");
        
        EventItem storage evt = events[eventId];
        require(evt.id == eventId && evt.id != 0, "EventContract: Event does not exist");
        require(block.timestamp < evt.deadline, "EventContract: Staking closed for this event");
        require(!evt.isResolved, "EventContract: Event is already resolved");

        if (choice) {
            yesStakes[eventId][msg.sender] += msg.value;
            evt.totalYesPool += msg.value;
        } else {
            noStakes[eventId][msg.sender] += msg.value;
            evt.totalNoPool += msg.value;
        }

        emit PredictionPlaced(eventId, msg.sender, choice, msg.value);
    }

    /**
     * @notice Resolves an event with the final verified outcome. Restricted to admin/oracle.
     * @param eventId The event identifier to settle.
     * @param outcome The verified outcome (true = YES, false = NO).
     */
    function resolveEvent(
        uint256 eventId,
        bool outcome
    ) external onlyAdmin {
        EventItem storage evt = events[eventId];
        require(evt.id == eventId && evt.id != 0, "EventContract: Event does not exist");
        require(!evt.isResolved, "EventContract: Event is already resolved");
        require(block.timestamp >= evt.deadline, "EventContract: Cannot resolve before deadline");

        evt.isResolved = true;
        evt.outcome = outcome;

        emit EventResolved(eventId, outcome, evt.totalYesPool, evt.totalNoPool);
    }

    /**
     * @notice Claims proportional share of the total pool for winning predictors.
     * @param eventId The event identifier to claim rewards from.
     */
    function claimReward(
        uint256 eventId
    ) external nonReentrant {
        EventItem storage evt = events[eventId];
        require(evt.isResolved, "EventContract: Event is not yet resolved");
        require(!hasClaimed[eventId][msg.sender], "EventContract: Reward already claimed");

        uint256 userWinningStake = evt.outcome
            ? yesStakes[eventId][msg.sender]
            : noStakes[eventId][msg.sender];

        require(userWinningStake > 0, "EventContract: No winning stake found for user");

        uint256 winningPool = evt.outcome ? evt.totalYesPool : evt.totalNoPool;
        uint256 totalPool = evt.totalYesPool + evt.totalNoPool;

        // Proportional payout: userStake * totalPool / winningPool
        uint256 rewardAmount = (userWinningStake * totalPool) / winningPool;

        hasClaimed[eventId][msg.sender] = true;

        (bool success, ) = payable(msg.sender).call{value: rewardAmount}("");
        require(success, "EventContract: Native transfer failed");

        emit RewardClaimed(eventId, msg.sender, rewardAmount);
    }

    /**
     * @notice Helper function to view user's positions and claimable reward on an event.
     * @param eventId The event identifier.
     * @param user The address of the predictor.
     */
    function getUserPosition(
        uint256 eventId,
        address user
    ) external view returns (
        uint256 yesStake,
        uint256 noStake,
        bool claimed,
        uint256 claimableReward
    ) {
        EventItem storage evt = events[eventId];
        yesStake = yesStakes[eventId][user];
        noStake = noStakes[eventId][user];
        claimed = hasClaimed[eventId][user];

        if (evt.isResolved && !claimed) {
            uint256 winningStake = evt.outcome ? yesStake : noStake;
            uint256 winningPool = evt.outcome ? evt.totalYesPool : evt.totalNoPool;
            uint256 totalPool = evt.totalYesPool + evt.totalNoPool;

            if (winningStake > 0 && winningPool > 0) {
                claimableReward = (winningStake * totalPool) / winningPool;
            }
        }
    }

    /**
     * @notice Allows current admin to transfer admin/oracle rights to a new address.
     * @param newAdmin Address of the new admin.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "EventContract: New admin is zero address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }
}

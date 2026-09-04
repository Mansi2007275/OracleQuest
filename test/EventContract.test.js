const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('EventContract', function () {
  let eventContract;
  let admin, alice, bob, carol;

  const ONE_DAY = 60 * 60 * 24;
  const STAKE_AMOUNT = ethers.parseEther('0.1');

  // ─────────────────────────────────────────────────────────────────
  // Deploy a fresh contract before every test
  // ─────────────────────────────────────────────────────────────────
  beforeEach(async function () {
    [admin, alice, bob, carol] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('EventContract', admin);
    eventContract = await Factory.deploy();
    await eventContract.waitForDeployment();
  });

  // ─────────────────────────────────────────────────────────────────
  // 1. Deployment
  // ─────────────────────────────────────────────────────────────────
  describe('Deployment', function () {
    it('Should set the deployer as admin', async function () {
      expect(await eventContract.admin()).to.equal(admin.address);
    });

    it('Should start with zero events', async function () {
      expect(await eventContract.eventCount()).to.equal(0n);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 2. createEvent()
  // ─────────────────────────────────────────────────────────────────
  describe('createEvent()', function () {
    it('Should create an event with correct title and deadline', async function () {
      const now = await time.latest();
      const deadline = now + ONE_DAY;

      await expect(eventContract.createEvent('Will BTC hit $150k?', deadline))
        .to.emit(eventContract, 'EventCreated')
        .withArgs(1n, 'Will BTC hit $150k?', BigInt(deadline), admin.address);

      const evt = await eventContract.events(1n);
      expect(evt.id).to.equal(1n);
      expect(evt.title).to.equal('Will BTC hit $150k?');
      expect(evt.deadline).to.equal(BigInt(deadline));
      expect(evt.isResolved).to.be.false;
      expect(evt.totalYesPool).to.equal(0n);
      expect(evt.totalNoPool).to.equal(0n);
    });

    it('Should auto-increment event IDs', async function () {
      const now = await time.latest();
      await eventContract.createEvent('Event A', now + ONE_DAY);
      await eventContract.createEvent('Event B', now + ONE_DAY * 2);

      expect(await eventContract.eventCount()).to.equal(2n);
      expect((await eventContract.events(1n)).title).to.equal('Event A');
      expect((await eventContract.events(2n)).title).to.equal('Event B');
    });

    it('Should revert if title is empty', async function () {
      const now = await time.latest();
      await expect(
        eventContract.createEvent('', now + ONE_DAY)
      ).to.be.revertedWith('EventContract: Title cannot be empty');
    });

    it('Should revert if deadline is in the past', async function () {
      const past = (await time.latest()) - 60;
      await expect(
        eventContract.createEvent('Past Event', past)
      ).to.be.revertedWith('EventContract: Deadline must be in the future');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 3. placePrediction()
  // ─────────────────────────────────────────────────────────────────
  describe('placePrediction()', function () {
    let eventId;
    let deadline;

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will ETH flip BTC?', deadline);
      eventId = 1n;
    });

    it('Should accept YES prediction from alice and update YES pool', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT })
      )
        .to.emit(eventContract, 'PredictionPlaced')
        .withArgs(eventId, alice.address, true, STAKE_AMOUNT);

      const evt = await eventContract.events(eventId);
      expect(evt.totalYesPool).to.equal(STAKE_AMOUNT);
      expect(evt.totalNoPool).to.equal(0n);
    });

    it('Should accept NO prediction from bob and update NO pool', async function () {
      await expect(
        eventContract.connect(bob).placePrediction(eventId, false, { value: STAKE_AMOUNT })
      )
        .to.emit(eventContract, 'PredictionPlaced')
        .withArgs(eventId, bob.address, false, STAKE_AMOUNT);

      const evt = await eventContract.events(eventId);
      expect(evt.totalNoPool).to.equal(STAKE_AMOUNT);
      expect(evt.totalYesPool).to.equal(0n);
    });

    it('Should accumulate multiple stakes into separate pools', async function () {
      const aliceStake = ethers.parseEther('0.2');
      const bobStake   = ethers.parseEther('0.1');

      await eventContract.connect(alice).placePrediction(eventId, true,  { value: aliceStake });
      await eventContract.connect(bob).placePrediction(eventId,   false, { value: bobStake });

      const evt = await eventContract.events(eventId);
      expect(evt.totalYesPool).to.equal(aliceStake);
      expect(evt.totalNoPool).to.equal(bobStake);
    });

    it('Should revert if stake is zero', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: 0n })
      ).to.be.revertedWith('EventContract: Stake must be greater than 0');
    });

    it('Should revert after deadline has passed', async function () {
      await time.increaseTo(deadline + 1);
      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT })
      ).to.be.revertedWith('EventContract: Staking closed for this event');
    });

    it('Should revert for non-existent event', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(999n, true, { value: STAKE_AMOUNT })
      ).to.be.revertedWith('EventContract: Event does not exist');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 4. resolveEvent()
  // ─────────────────────────────────────────────────────────────────
  describe('resolveEvent()', function () {
    let eventId;
    let deadline;

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will Somnia hit 1M TPS?', deadline);
      eventId = 1n;

      await eventContract.connect(alice).placePrediction(eventId, true,  { value: STAKE_AMOUNT });
      await eventContract.connect(bob).placePrediction(eventId,   false, { value: STAKE_AMOUNT });
    });

    it('Should resolve with YES outcome and emit event', async function () {
      await time.increaseTo(deadline + 1);

      await expect(eventContract.connect(admin).resolveEvent(eventId, true))
        .to.emit(eventContract, 'EventResolved')
        .withArgs(eventId, true, STAKE_AMOUNT, STAKE_AMOUNT);

      const evt = await eventContract.events(eventId);
      expect(evt.isResolved).to.be.true;
      expect(evt.outcome).to.be.true;
    });

    it('Should resolve with NO outcome', async function () {
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, false);

      const evt = await eventContract.events(eventId);
      expect(evt.isResolved).to.be.true;
      expect(evt.outcome).to.be.false;
    });

    it('Should REVERT if a NON-ADMIN (carol) tries to resolve', async function () {
      await time.increaseTo(deadline + 1);
      await expect(
        eventContract.connect(carol).resolveEvent(eventId, true)
      ).to.be.revertedWith('EventContract: Only admin/oracle can call this');
    });

    it('Should revert if called before deadline', async function () {
      await expect(
        eventContract.connect(admin).resolveEvent(eventId, true)
      ).to.be.revertedWith('EventContract: Cannot resolve before deadline');
    });

    it('Should revert on double-resolve', async function () {
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);

      await expect(
        eventContract.connect(admin).resolveEvent(eventId, false)
      ).to.be.revertedWith('EventContract: Event is already resolved');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 5. claimReward()
  // ─────────────────────────────────────────────────────────────────
  describe('claimReward()', function () {
    let eventId;
    let deadline;

    const aliceStake = ethers.parseEther('0.2'); // YES predictor
    const bobStake   = ethers.parseEther('0.1'); // NO predictor

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will ETH break $10k?', deadline);
      eventId = 1n;

      await eventContract.connect(alice).placePrediction(eventId, true,  { value: aliceStake });
      await eventContract.connect(bob).placePrediction(eventId,   false, { value: bobStake });

      // Resolve YES — alice wins
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);
    });

    it('Should allow winning predictor (alice, YES) to claim full pool', async function () {
      const totalPool = aliceStake + bobStake;

      await expect(eventContract.connect(alice).claimReward(eventId))
        .to.emit(eventContract, 'RewardClaimed')
        .withArgs(eventId, alice.address, totalPool);

      const pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.claimed).to.be.true;
    });

    it("Should increase alice's balance after a successful claim", async function () {
      const totalPool = aliceStake + bobStake;
      const balanceBefore = await ethers.provider.getBalance(alice.address);

      const tx = await eventContract.connect(alice).claimReward(eventId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(alice.address);
      expect(balanceAfter).to.be.closeTo(
        balanceBefore + totalPool - gasUsed,
        ethers.parseEther('0.001')
      );
    });

    it('Should REVERT for losing predictor (bob, NO) trying to claim', async function () {
      await expect(
        eventContract.connect(bob).claimReward(eventId)
      ).to.be.revertedWith('EventContract: No winning stake found for user');
    });

    it('Should REVERT for non-participant (carol) trying to claim', async function () {
      await expect(
        eventContract.connect(carol).claimReward(eventId)
      ).to.be.revertedWith('EventContract: No winning stake found for user');
    });

    it('Should REVERT on double-claim', async function () {
      await eventContract.connect(alice).claimReward(eventId);

      await expect(
        eventContract.connect(alice).claimReward(eventId)
      ).to.be.revertedWith('EventContract: Reward already claimed');
    });

    it('Should REVERT if event is not yet resolved', async function () {
      const now = await time.latest();
      await eventContract.createEvent('Unresolved Event', now + ONE_DAY);
      const newId = 2n;
      await eventContract.connect(alice).placePrediction(newId, true, { value: STAKE_AMOUNT });

      await expect(
        eventContract.connect(alice).claimReward(newId)
      ).to.be.revertedWith('EventContract: Event is not yet resolved');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 6. getUserPosition() view helper
  // ─────────────────────────────────────────────────────────────────
  describe('getUserPosition()', function () {
    it('Should return zero claimable reward before resolution, correct reward after', async function () {
      const now = await time.latest();
      const deadline = now + ONE_DAY;
      await eventContract.createEvent('Position test', deadline);
      const eventId = 1n;

      await eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT });

      // Before resolution: claimableReward should be 0
      let pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.yesStake).to.equal(STAKE_AMOUNT);
      expect(pos.noStake).to.equal(0n);
      expect(pos.claimed).to.be.false;
      expect(pos.claimableReward).to.equal(0n);

      // Resolve: alice is sole staker → wins everything
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);

      pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.claimableReward).to.equal(STAKE_AMOUNT);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 7. transferAdmin()
  // ─────────────────────────────────────────────────────────────────
  describe('transferAdmin()', function () {
    it('Should allow admin to transfer rights and emit event', async function () {
      await expect(eventContract.connect(admin).transferAdmin(alice.address))
        .to.emit(eventContract, 'AdminTransferred')
        .withArgs(admin.address, alice.address);

      expect(await eventContract.admin()).to.equal(alice.address);
    });

    it('Should revert if non-admin tries to transfer', async function () {
      await expect(
        eventContract.connect(carol).transferAdmin(carol.address)
      ).to.be.revertedWith('EventContract: Only admin/oracle can call this');
    });

    it('Should revert if transferring to zero address', async function () {
      await expect(
        eventContract.connect(admin).transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith('EventContract: New admin is zero address');
    });
  });
});

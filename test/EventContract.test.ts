import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EventContract } from '../typechain-types';

describe('EventContract', function () {
  let eventContract: EventContract;
  let admin: SignerWithAddress;
  let alice: SignerWithAddress; // YES predictor
  let bob: SignerWithAddress;   // NO predictor
  let carol: SignerWithAddress; // non-participant

  // Fixed deadline: 24 hours from now (will be manipulated in tests)
  const ONE_DAY = 60 * 60 * 24;
  const STAKE_AMOUNT = ethers.parseEther('0.1');

  // ─────────────────────────────────────────────────────────────────
  // Shared fixture: deploy fresh contract before every test
  // ─────────────────────────────────────────────────────────────────
  beforeEach(async function () {
    [admin, alice, bob, carol] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory('EventContract', admin);
    eventContract = (await Factory.deploy()) as EventContract;
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
  // 2. createEvent
  // ─────────────────────────────────────────────────────────────────
  describe('createEvent()', function () {
    it('Should create an event with correct title and deadline', async function () {
      const now = await time.latest();
      const deadline = now + ONE_DAY;

      await expect(eventContract.createEvent('Will BTC hit $150k by Q3?', deadline))
        .to.emit(eventContract, 'EventCreated')
        .withArgs(1n, 'Will BTC hit $150k by Q3?', BigInt(deadline), admin.address);

      const evt = await eventContract.events(1n);
      expect(evt.id).to.equal(1n);
      expect(evt.title).to.equal('Will BTC hit $150k by Q3?');
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
  // 3. placePrediction
  // ─────────────────────────────────────────────────────────────────
  describe('placePrediction()', function () {
    let eventId: bigint;
    let deadline: number;

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will ETH flip BTC?', deadline);
      eventId = 1n;
    });

    it('Should accept a YES (true) prediction from alice and update pool', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT })
      )
        .to.emit(eventContract, 'PredictionPlaced')
        .withArgs(eventId, alice.address, true, STAKE_AMOUNT);

      const evt = await eventContract.events(eventId);
      expect(evt.totalYesPool).to.equal(STAKE_AMOUNT);
      expect(evt.totalNoPool).to.equal(0n);
    });

    it('Should accept a NO (false) prediction from bob and update pool', async function () {
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
      const bobStake = ethers.parseEther('0.1');

      await eventContract.connect(alice).placePrediction(eventId, true, { value: aliceStake });
      await eventContract.connect(bob).placePrediction(eventId, false, { value: bobStake });

      const evt = await eventContract.events(eventId);
      expect(evt.totalYesPool).to.equal(aliceStake);
      expect(evt.totalNoPool).to.equal(bobStake);
    });

    it('Should revert if stake is zero', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: 0n })
      ).to.be.revertedWith('EventContract: Stake must be greater than 0');
    });

    it('Should revert if event deadline has passed', async function () {
      // Fast-forward time past deadline
      await time.increaseTo(deadline + 1);

      await expect(
        eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT })
      ).to.be.revertedWith('EventContract: Staking closed for this event');
    });

    it('Should revert if event does not exist', async function () {
      await expect(
        eventContract.connect(alice).placePrediction(999n, true, { value: STAKE_AMOUNT })
      ).to.be.revertedWith('EventContract: Event does not exist');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 4. resolveEvent
  // ─────────────────────────────────────────────────────────────────
  describe('resolveEvent()', function () {
    let eventId: bigint;
    let deadline: number;

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will Somnia hit 1M TPS?', deadline);
      eventId = 1n;

      // Both sides stake
      await eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT });
      await eventContract.connect(bob).placePrediction(eventId, false, { value: STAKE_AMOUNT });
    });

    it('Should resolve event with YES outcome after deadline', async function () {
      await time.increaseTo(deadline + 1);

      await expect(eventContract.connect(admin).resolveEvent(eventId, true))
        .to.emit(eventContract, 'EventResolved')
        .withArgs(eventId, true, STAKE_AMOUNT, STAKE_AMOUNT);

      const evt = await eventContract.events(eventId);
      expect(evt.isResolved).to.be.true;
      expect(evt.outcome).to.be.true;
    });

    it('Should resolve event with NO outcome after deadline', async function () {
      await time.increaseTo(deadline + 1);

      await eventContract.connect(admin).resolveEvent(eventId, false);

      const evt = await eventContract.events(eventId);
      expect(evt.isResolved).to.be.true;
      expect(evt.outcome).to.be.false;
    });

    it('Should revert if a NON-ADMIN (carol) tries to resolve', async function () {
      await time.increaseTo(deadline + 1);

      await expect(
        eventContract.connect(carol).resolveEvent(eventId, true)
      ).to.be.revertedWith('EventContract: Only admin/oracle can call this');
    });

    it('Should revert if trying to resolve before deadline', async function () {
      await expect(
        eventContract.connect(admin).resolveEvent(eventId, true)
      ).to.be.revertedWith('EventContract: Cannot resolve before deadline');
    });

    it('Should revert if event is already resolved', async function () {
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);

      await expect(
        eventContract.connect(admin).resolveEvent(eventId, false)
      ).to.be.revertedWith('EventContract: Event is already resolved');
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 5. claimReward
  // ─────────────────────────────────────────────────────────────────
  describe('claimReward()', function () {
    let eventId: bigint;
    let deadline: number;
    const aliceStake = ethers.parseEther('0.2'); // alice bets YES
    const bobStake = ethers.parseEther('0.1');   // bob bets NO

    beforeEach(async function () {
      const now = await time.latest();
      deadline = now + ONE_DAY;
      await eventContract.createEvent('Will ETH break $10k?', deadline);
      eventId = 1n;

      await eventContract.connect(alice).placePrediction(eventId, true, { value: aliceStake });
      await eventContract.connect(bob).placePrediction(eventId, false, { value: bobStake });

      // Move past deadline and resolve YES
      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);
    });

    it('Should allow the winning predictor (alice, YES) to claim their proportional reward', async function () {
      // Total pool = 0.3 ETH, alice holds 100% of yes pool → gets everything
      const totalPool = aliceStake + bobStake;

      await expect(eventContract.connect(alice).claimReward(eventId))
        .to.emit(eventContract, 'RewardClaimed')
        .withArgs(eventId, alice.address, totalPool);

      const pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.claimed).to.be.true;
    });

    it('Should increase winner balance after claim', async function () {
      const totalPool = aliceStake + bobStake;
      const balanceBefore = await ethers.provider.getBalance(alice.address);

      const tx = await eventContract.connect(alice).claimReward(eventId);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(alice.address);
      expect(balanceAfter).to.be.closeTo(balanceBefore + totalPool - gasUsed, ethers.parseEther('0.001'));
    });

    it('Should revert if the losing predictor (bob, NO) tries to claim', async function () {
      await expect(
        eventContract.connect(bob).claimReward(eventId)
      ).to.be.revertedWith('EventContract: No winning stake found for user');
    });

    it('Should revert if a non-participant (carol) tries to claim', async function () {
      await expect(
        eventContract.connect(carol).claimReward(eventId)
      ).to.be.revertedWith('EventContract: No winning stake found for user');
    });

    it('Should revert on double-claim attempt', async function () {
      await eventContract.connect(alice).claimReward(eventId);

      await expect(
        eventContract.connect(alice).claimReward(eventId)
      ).to.be.revertedWith('EventContract: Reward already claimed');
    });

    it('Should revert if event is not yet resolved', async function () {
      // Create a fresh unresolved event
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
  // 6. getUserPosition view helper
  // ─────────────────────────────────────────────────────────────────
  describe('getUserPosition()', function () {
    it('Should return correct positions before and after resolution', async function () {
      const now = await time.latest();
      const deadline = now + ONE_DAY;
      await eventContract.createEvent('Position test', deadline);
      const eventId = 1n;

      await eventContract.connect(alice).placePrediction(eventId, true, { value: STAKE_AMOUNT });

      let pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.yesStake).to.equal(STAKE_AMOUNT);
      expect(pos.noStake).to.equal(0n);
      expect(pos.claimed).to.be.false;
      expect(pos.claimableReward).to.equal(0n); // not resolved yet

      await time.increaseTo(deadline + 1);
      await eventContract.connect(admin).resolveEvent(eventId, true);

      pos = await eventContract.getUserPosition(eventId, alice.address);
      expect(pos.claimableReward).to.equal(STAKE_AMOUNT); // only staker → gets all
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 7. transferAdmin
  // ─────────────────────────────────────────────────────────────────
  describe('transferAdmin()', function () {
    it('Should allow admin to transfer admin rights', async function () {
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

    it('Should revert transferring to zero address', async function () {
      await expect(
        eventContract.connect(admin).transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith('EventContract: New admin is zero address');
    });
  });
});

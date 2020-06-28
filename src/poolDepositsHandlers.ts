import {
  DepositAdded,
  DepositWithdrawn,
  EmergencyStateReached,
  EmergencyVote,
  EmergencyWithdrawl,
  ProposalAdded,
  ProposalWithdrawn,
  RemoveEmergencyVote,
  InterestSent,
  PoolDeposits,
  PartialDepositWithdrawn,
  WinnerPayout,
} from "../generated/PoolDeposits/PoolDeposits";
import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { Project, User, VoteManager, Iteration } from "../generated/schema";
import { VOTES_MANAGER_ENTITY_ID } from "./constants";

export function handleDepositAdded(event: DepositAdded): void {
  // Load Variables
  let userAddress = event.params.user.toHexString();
  let amountDeposit = event.params.amount;
  let timeStamp = event.block.timestamp;
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let iteration = Iteration.load(voteManager.currentIteration);

  let user = User.load(userAddress);
  if (user == null) {
    // Case if they are first time user
    user = new User(userAddress);
    user.amount = BigInt.fromI32(0);
    user.timeJoinedLeft = [timeStamp];
    user.iterationJoinedLeft = [voteManager.currentIteration];
    user.votes = [];
    user.projects = [];
    voteManager.numberOfUsers = voteManager.numberOfUsers.plus(
      BigInt.fromI32(1)
    );
  } else {
    // If they are a returning user who currently has zero funds
    if (user.amount == BigInt.fromI32(0)) {
      user.timeJoinedLeft = user.timeJoinedLeft.concat([timeStamp]);
      user.iterationJoinedLeft = user.iterationJoinedLeft.concat([
        voteManager.currentIteration,
      ]);
      voteManager.numberOfUsers = voteManager.numberOfUsers.plus(
        BigInt.fromI32(1)
      );
    }
  }

  user.amount = user.amount.plus(amountDeposit);
  user.nextIterationEligibleToVote = iteration.iterationNumber.plus(
    BigInt.fromI32(1)
  );

  voteManager.totalDepositedUsers = voteManager.totalDepositedUsers.plus(
    amountDeposit
  );
  voteManager.totalDeposited = voteManager.totalDeposited.plus(amountDeposit);

  user.save();
  voteManager.save();
}

export function handleDepositWithdrawn(event: DepositWithdrawn): void {
  let userAddress = event.params.user.toHexString();
  let user = User.load(userAddress);
  let timeStamp = event.block.timestamp;

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDepositedUsers = voteManager.totalDepositedUsers.minus(
    user.amount
  );
  voteManager.totalDeposited = voteManager.totalDeposited.minus(user.amount);
  voteManager.numberOfUsers = voteManager.numberOfUsers.minus(
    BigInt.fromI32(1)
  );

  user.amount = BigInt.fromI32(0);
  user.timeJoinedLeft = user.timeJoinedLeft.concat([timeStamp]);
  user.iterationJoinedLeft = user.iterationJoinedLeft.concat([
    voteManager.currentIteration,
  ]);

  user.save();
  voteManager.save();
}

export function handlePartialDepositWithdrawn(
  event: PartialDepositWithdrawn
): void {
  let userAddress = event.params.user.toHexString();
  let amount = event.params.amount;
  let user = User.load(userAddress);

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDepositedUsers = voteManager.totalDepositedUsers.minus(
    amount
  );
  voteManager.totalDeposited = voteManager.totalDeposited.minus(amount);

  user.amount = user.amount.minus(amount);

  user.save();
  voteManager.save();
}

export function handleProposalAdded(event: ProposalAdded): void {
  // Load Variables
  let projectId = event.params.proposalId;
  let benefactor = event.params.benefactor;
  let projectDataIdentifier = event.params.proposalIdentifier.toString();
  let timeStamp = event.block.timestamp;

  let poolDepositsContract = PoolDeposits.bind(event.address);
  let proposalAmount = poolDepositsContract.proposalAmount();

  // handle and add to the total deposited.
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDeposited = voteManager.totalDeposited.plus(proposalAmount);
  voteManager.totalDepositedProjects = voteManager.totalDepositedProjects.plus(
    proposalAmount
  );
  voteManager.numberOfProjects = voteManager.numberOfProjects.plus(
    BigInt.fromI32(1)
  );

  let user = User.load(benefactor.toHexString());
  if (user == null) {
    user = new User(benefactor.toHexString());
    user.timeJoinedLeft = [timeStamp];
    user.iterationJoinedLeft = [voteManager.currentIteration];
    user.votes = [];
    user.projects = [];
    user.nextIterationEligibleToVote = BigInt.fromI32(0);
  } else {
    user.timeJoinedLeft = user.timeJoinedLeft.concat([timeStamp]);
    user.iterationJoinedLeft = user.iterationJoinedLeft.concat([
      voteManager.currentIteration,
    ]);
  }

  // Perform logic and updates
  let newProject = new Project(projectId.toString());
  newProject.benefactor = user.id;
  newProject.projectDataIdentifier = projectDataIdentifier;
  newProject.projectState = "Active";
  newProject.projectVoteResults = [];
  newProject.iterationsWon = [];

  user.projects = user.projects.concat([newProject.id]);
  user.amount = proposalAmount;

  // Save results
  user.save();
  newProject.save();
  voteManager.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {
  // Nothing really needs to be done here. There is another proposalWithdrawn event in the other
  // contract which should set the projectState to Withdrawn.
  // remove deposit from total deposited here
  let proposalAddress = event.params.benefactor;
  let poolDepositsContract = PoolDeposits.bind(event.address);
  let proposalAmount = poolDepositsContract.depositedDai(proposalAddress);
  let timeStamp = event.block.timestamp;

  // handle and add to the total deposited.
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDeposited = voteManager.totalDeposited.minus(proposalAmount);
  voteManager.totalDepositedProjects = voteManager.totalDepositedProjects.minus(
    proposalAmount
  );
  voteManager.numberOfProjects = voteManager.numberOfProjects.minus(
    BigInt.fromI32(1)
  );

  let user = User.load(proposalAddress.toHexString());
  user.amount = BigInt.fromI32(0);
  user.timeJoinedLeft = user.timeJoinedLeft.concat([timeStamp]);
  user.iterationJoinedLeft = user.iterationJoinedLeft.concat([
    voteManager.currentIteration,
  ]);

  user.save();
  voteManager.save();
}

export function handleInterestSent(event: InterestSent): void {
  // Load Variables
  let address = event.params.user;
  let amount = event.params.amount;
  //let iterationNo = event.params.iteration.toString();

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);

  let iteration = Iteration.load(voteManager.currentIteration);

  iteration.interestDistribution = iteration.interestDistribution.concat([
    amount,
  ]);
  iteration.fundsDistributed = iteration.fundsDistributed.plus(amount);
  iteration.save();
}

export function handleWinnerPayout(event: WinnerPayout): void {
  // Load Variables
  let address = event.params.user;
  let amount = event.params.amount;
  let iterationNo = event.params.iteration.toString();

  //let user = User.load(address.toHexString());

  let iteration = Iteration.load(iterationNo);
  if (iteration == null) {
    log.critical(
      "The iteration is null, but it should be defined! #iteration={}",
      [iterationNo]
    );
  }

  iteration.interestDistribution = iteration.interestDistribution.concat([
    amount,
  ]);
  iteration.payoutAmountForWinnerOfPreviousIteration = amount;
  iteration.fundsDistributed = iteration.fundsDistributed.plus(amount);
  iteration.save();
}

// Will leave these blank.
export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

// https://gitter.im/kovan-testnet/faucet 0xd3Cbce59318B2E570883719c8165F9390A12BdD6

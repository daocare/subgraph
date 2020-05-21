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
} from "../generated/PoolDeposits/PoolDeposits";
import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { Project, User, VoteManager, Iteration } from "../generated/schema";
import { VOTES_MANAGER_ENTITY_ID } from "./constants";

export function handleDepositAdded(event: DepositAdded): void {
  // Load Variables
  let userAddress = event.params.user.toHexString();
  let amountDeposit = event.params.amount;
  let timeStamp = event.block.timestamp;

  let user = User.load(userAddress);
  if (user == null) {
    user = new User(userAddress);
    user.timeJoined = [timeStamp];
    user.votes = [];
  } else {
    user.timeJoined = user.timeJoined.concat([timeStamp]);
  }
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDepositedUsers = voteManager.totalDepositedUsers.plus(
    amountDeposit
  );
  voteManager.totalDeposited = voteManager.totalDeposited.plus(amountDeposit);

  user.amount = amountDeposit;
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

  user.amount = BigInt.fromI32(0);
  user.timeJoined = user.timeJoined.concat([timeStamp]);
  user.save();
  voteManager.save();
}

export function handleProposalAdded(event: ProposalAdded): void {
  // Load Variables
  let projectId = event.params.proposalId;
  let benefactor = event.params.benefactor;
  let projectDataIdentifier = event.params.proposalIdentifier.toString();

  let voteManagerContract = PoolDeposits.bind(event.address);
  let proposalAmount = voteManagerContract.proposalAmount();

  // handle and add to the total deposited.
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDeposited = voteManager.totalDeposited.plus(proposalAmount);
  voteManager.totalDepositedProjects = voteManager.totalDepositedProjects.plus(
    proposalAmount
  );

  // Perform logic and updates
  let newProject = new Project(projectId.toString());
  newProject.benefactor = benefactor;
  newProject.projectDataIdentifier = projectDataIdentifier;
  newProject.projectState = "Active";
  newProject.projectVoteResults = [];

  // Save results
  newProject.save();
  voteManager.save();
}

export function handleInterestSent(event: InterestSent): void {
  // Load Variables
  let address = event.params.user;
  let amount = event.params.amount;
  let iterationNo = event.params.iteration.toString();

  //let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let iteration = Iteration.load(iterationNo);

  iteration.interestDistribution = iteration.interestDistribution.concat([
    amount,
  ]);

  iteration.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {
  // Nothing really needs to be done here. There is another proposalWithdrawn event in the other
  // contract which should set the projectState to Withdrawn.
  // remove deposit from total deposited here
  let proposalAddress = event.params.benefactor;
  let voteManagerContract = PoolDeposits.bind(event.address);
  let proposalAmount = voteManagerContract.depositedDai(proposalAddress);

  // handle and add to the total deposited.
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  voteManager.totalDeposited = voteManager.totalDeposited.minus(proposalAmount);
  voteManager.totalDepositedProjects = voteManager.totalDepositedProjects.minus(
    proposalAmount
  );

  voteManager.save();
}

// Will leave these blank.
export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

// https://gitter.im/kovan-testnet/faucet 0xd3Cbce59318B2E570883719c8165F9390A12BdD6

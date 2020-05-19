import {
  DepositAdded,
  DepositWithdrawn,
  EmergencyStateReached,
  EmergencyVote,
  EmergencyWithdrawl,
  ProposalAdded,
  ProposalWithdrawn,
  RemoveEmergencyVote,
} from "../generated/PoolDeposits/PoolDeposits";
import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { Project, User } from "../generated/schema";

export function handleDepositAdded(event: DepositAdded): void {
  // Load Variables
  let userAddress = event.params.user.toHexString();
  let amountDeposit = event.params.amount;

  let user = User.load(userAddress);
  if (user == null) {
    user = new User(userAddress);
    user.timeJoined = BigInt.fromI32(0);
    user.votes = [];
  }
  //user.timeJoined = user.timeJoined.concat([BigInt.fromI32(Date.now())]); // Set this equal to now timestamp
  //user.timeJoined = user.timeJoined.concat([BigInt.fromI32(0)]); // Set this equal to now timestamp
  user.amount = amountDeposit;
  user.save();
}

export function handleDepositWithdrawn(event: DepositWithdrawn): void {
  // let userAddress = event.params.user.toHexString();
  // let user = User.load(userAddress);
  // user.amount = BigInt.fromI32(0);
  // //user.timeJoined = user.timeJoined.concat(BigInt.fromI32(0));
  // user.timeJoined = BigInt.fromI32(0);
  // user.save();
}

export function handleProposalAdded(event: ProposalAdded): void {
  // Load Variables
  let projectId = event.params.proposalId;
  let benefactor = event.params.benefactor;
  // TODO: investigate this `toString`, didn't check what it does.
  let projectDataIdentifier = event.params.proposalIdentifier.toString();

  // Perform logic and updates
  let newProject = new Project(projectId.toString());
  newProject.benefactor = benefactor;
  newProject.projectDataIdentifier = projectDataIdentifier;
  newProject.projectState = "Active";
  newProject.projectVoteResults = [];

  // Save results
  newProject.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {
  // Nothing really needs to be done here. There is another proposalWithdrawn event in the other
  // contract which should set the projectState to Withdrawn.
}

// Will leave these blank.
export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

// https://gitter.im/kovan-testnet/faucet 0xd3Cbce59318B2E570883719c8165F9390A12BdD6

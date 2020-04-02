import {
  DepositAdded,
  DepositWithdrawn,
  EmergencyStateReached,
  EmergencyVote,
  EmergencyWithdrawl,
  ProposalAdded,
  ProposalWithdrawn,
  RemoveEmergencyVote
} from "../generated/PoolDeposits/PoolDeposits";
import { Project } from "../generated/schema";

export function handleDepositAdded(event: DepositAdded): void {}

export function handleDepositWithdrawn(event: DepositWithdrawn): void {}

export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleProposalAdded(event: ProposalAdded): void {
  // Load Variables
  const projectId = event.params.proposalId.toI32();
  const benefactor = event.params.benefactor;
  // TODO: investigate this `toString`, didn't check what it does.
  const projectDataIdentifier = event.params.proposalHash.toString();

  // Perform logic and updates
  let newProject = new Project(projectId.toString());
  newProject.projectId = projectId;
  newProject.benefactor = benefactor;
  newProject.projectDataIdentifier = projectDataIdentifier;

  // Save results
  newProject.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

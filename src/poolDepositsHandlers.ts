import { BigInt } from "@graphprotocol/graph-ts";
import {
  Contract,
  DepositAdded,
  DepositWithdrawn,
  EmergencyStateReached,
  EmergencyVote,
  EmergencyWithdrawl,
  ProposalAdded,
  ProposalWithdrawn,
  RemoveEmergencyVote
} from "../generated/PoolDeposits/PoolDeposits";
import {} from "../generated/schema";

export function handleDepositAdded(event: DepositAdded): void {}

export function handleDepositWithdrawn(event: DepositWithdrawn): void {}

export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleProposalAdded(event: ProposalAdded): void {}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

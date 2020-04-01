import { BigInt } from "@graphprotocol/graph-ts";
import {
  Contract,
  IterationChanged,
  IterationWinner,
  VoteDelegated,
  VotedDirect,
  VotedViaProxy
} from "../generated/NoLossDao/NoLossDao";
import { Iteration, Project } from "../generated/schema";

export function handleIterationChanged(event: IterationChanged): void {}

export function handleIterationWinner(event: IterationWinner): void {}

export function handleVoteDelegated(event: VoteDelegated): void {}

export function handleVotedDirect(event: VotedDirect): void {}

export function handleVotedViaProxy(event: VotedViaProxy): void {}

import {
  IterationChanged,
  IterationWinner,
  VoteDelegated,
  VotedDirect,
  VotedViaProxy,
} from "../generated/NoLossDao/NoLossDao";
import { Iteration, Project } from "../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function handleIterationChanged(event: IterationChanged): void {
  // Load Variables
  let nextIterationId = event.params.newIterationId.toI32();
  let miner = event.params.miner;

  // Perform logic and updates
  let newIteration = new Iteration(nextIterationId.toString());
  newIteration.iterationId = nextIterationId;
  newIteration.miner = miner;

  // Save results
  newIteration.save();
}

export function handleIterationWinner(event: IterationWinner): void {
  // Load Variables
  let iterationId = event.params.propsalIteration.toI32();
  let topProject = event.params.projectId.toString();

  // Perform logic and updates
  let previousIteration = Iteration.load(iterationId.toString());
  if (previousIteration != null) {
    log.critical(
      "Critical - THIS SHOULD NOT HAPPEN, iteration #{} doesn't exist even though it should.",
      [iterationId.toString()]
    );
  }
  previousIteration.topProject = topProject;

  // Save results
  previousIteration.save();
}

export function handleVoteDelegated(event: VoteDelegated): void {}

export function handleVotedDirect(event: VotedDirect): void {}

export function handleVotedViaProxy(event: VotedViaProxy): void {}

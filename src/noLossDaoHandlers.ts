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
  const nextIterationId = event.params.newIterationId.toI32();
  const miner = event.params.miner.toI32();

  // Perform logic and updates
  const newIteration = new Iteration(nextIterationId.toString());
  newIteration.iterationId = nextIterationId;
  newIteration.miner = miner;

  // Save results
  newIteration.save();
}

// event IterationWinner(
//   uint256 indexed propsalIteration,
//   address indexed winner,
//   uint256 indexed projectId
// );

export function handleIterationWinner(event: IterationWinner): void {
  // Load Variables
  const iterationId = event.params.propsalIteration.toI32();
  const topProject = event.params.projectId.toString();

  // Perform logic and updates
  const previousIteration = Iteration.load(iterationId.toString());
  if (previousIteration != null) {
    log.critical(
      "Critical - THIS SHOULD NOT HAPPEN, iteration #{} doesn't exist even though it should.",
      [iterationId.teString()]
    );
  }
  previousIteration.topProject = topProject;

  // Save results
  previousIteration.save();
}

export function handleVoteDelegated(event: VoteDelegated): void {}

export function handleVotedDirect(event: VotedDirect): void {}

export function handleVotedViaProxy(event: VotedViaProxy): void {}

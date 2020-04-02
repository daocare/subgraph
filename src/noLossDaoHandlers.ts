import {
  IterationChanged,
  IterationWinner,
  VoteDelegated,
  VotedDirect,
  VotedViaProxy
} from "../generated/NoLossDao/NoLossDao";
import { Iteration, Project } from "../generated/schema";

export function handleIterationChanged(event: IterationChanged): void {
  // TODO: @JonJon - this doesn't include the iteration id. It makes it more difficult to deal with.
}

export function handleIterationWinner(event: IterationWinner): void {
  // Load Variables
  const iterationId = event.params.propsalIteration.toI32();
  const nextIterationId = iterationId + 1;
  const topProject = event.params.projectId.toString();
  // @JonJon, I don't think the "winner" parameter of this event is needed. It is directly linked to the projectId.

  // Perform logic and updates
  const previousIteration = Iteration.load(iterationId.toString());
  previousIteration.topProject = topProject;

  // NOTE: this should typically go in: `handleIterationChanged`; but currently no id exists in that event.
  const newIteration = new Iteration(nextIterationId.toString());
  newIteration.iterationId = nextIterationId;

  // Save results
  previousIteration.save();
  newIteration.save();
}

export function handleVoteDelegated(event: VoteDelegated): void {}

export function handleVotedDirect(event: VotedDirect): void {}

export function handleVotedViaProxy(event: VotedViaProxy): void {}

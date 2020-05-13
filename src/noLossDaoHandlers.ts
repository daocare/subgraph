import {
  IterationChanged,
  IterationWinner,
  VoteDelegated,
  VotedDirect,
  VotedViaProxy,
  ProposalActive,
  ProposalCooldown,
  ProposalWithdrawn,
} from "../generated/NoLossDao/NoLossDao";
import {
  Iteration,
  Project,
  VoteManager,
  User,
  Vote,
} from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { VOTES_MANAGER_ENTITY_ID } from "./constants";

export function handleIterationChanged(event: IterationChanged): void {
  // Load Variables
  let nextIterationId = event.params.newIterationId;
  let miner = event.params.miner;

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  if (voteManager == null) {
    let iteration = new Iteration(nextIterationId.toString());
    iteration.totalVotes = BigInt.fromI32(0);
    iteration.winningProposal = BigInt.fromI32(0);
    iteration.fundsDistributed = BigInt.fromI32(0);
    iteration.winningVotes = BigInt.fromI32(0);

    let voteManager = new VoteManager(VOTES_MANAGER_ENTITY_ID);
    voteManager.currentIteration = iteration.id;
    iteration.save();
    voteManager.save();
    return;
  }

  let completeIteration = Iteration.load(voteManager.currentIteration);
  voteManager.latestCompleteIteration = completeIteration.id;

  let currentIteration = new Iteration(nextIterationId.toString());
  currentIteration.totalVotes = BigInt.fromI32(0);
  currentIteration.winningProposal = BigInt.fromI32(0);
  currentIteration.fundsDistributed = BigInt.fromI32(0);
  currentIteration.winningVotes = BigInt.fromI32(0);
  currentIteration.projectVoteTallies = [];
  currentIteration.individualVotes = [];
  currentIteration.save();

  voteManager.currentIteration = currentIteration.id;
  voteManager.save();

  // Perform logic and updates
  // let newIteration = new Iteration(nextIterationId.toString());
  // newIteration.iterationId = nextIterationId;
  // newIteration.miner = miner;
  // // Save results
  // newIteration.save();
}

export function handleIterationWinner(event: IterationWinner): void {
  // // Load Variables
  // let iterationId = event.params.propsalIteration;
  // let topProject = event.params.projectId; //uint of project
  // let topProjectAddress = event.params.winner;
  // let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  // // Perform logic and updates
  // let previousIteration = Iteration.load(voteManager.currentIteration);
  // if (previousIteration != null) {
  //   log.critical(
  //     "Critical - THIS SHOULD NOT HAPPEN, iteration #{} doesn't exist even though it should.",
  //     [iterationId.toString()]
  //   );
  // }
  // previousIteration.winningProposal = topProject;
  // // Save results
  // previousIteration.save();
}

export function handleVoteDelegated(event: VoteDelegated): void {}

export function handleVotedDirect(event: VotedDirect): void {
  let voter = event.params.user;
  let proposalId = event.params.proposalId;

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let iterationNo = voteManager.currentIteration;
  let uniqueVoteId =
    iterationNo + "-" + proposalId.toString() + "-" + voter.toHexString();

  let currentIteration = Iteration.load(iterationNo);
  let user = User.load(voter.toHexString());

  let newVote = new Vote(uniqueVoteId);
  newVote.voteAmount = user.amount;
  newVote.voter = user.id;

  user.votes = user.votes.concat([uniqueVoteId]);

  currentIteration.individualVotes = currentIteration.individualVotes.concat([
    uniqueVoteId,
  ]);

  newVote.save();
  user.save();
  currentIteration.save();
}

export function handleVotedViaProxy(event: VotedViaProxy): void {}

export function handleProposalActive(event: ProposalActive): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());
  project.projectState = "Active";
  //project.save(); //Breaks If I try save, says cannot save entity without an ID.
}

export function handleProposalCooldown(event: ProposalCooldown): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());
  project.projectState = "Cooldown";
  //project.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());
  project.projectState = "Withdrawn";
  //project.save();
}

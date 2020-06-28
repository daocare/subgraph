import {
  IterationChanged,
  IterationWinner,
  VoteDelegated,
  VotedDirect,
  VotedViaProxy,
  ProposalActive,
  ProposalCooldown,
  NoLossDao,
  ProposalWithdrawn,
} from "../generated/NoLossDao/NoLossDao";
import {
  Iteration,
  Project,
  VoteManager,
  User,
  Vote,
  VoteStatus,
} from "../generated/schema";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { VOTES_MANAGER_ENTITY_ID } from "./constants";

export function handleIterationChanged(event: IterationChanged): void {
  // Load Variables
  let nextIterationId = event.params.newIterationId;
  let miner = event.params.miner;
  let timeStamp = event.block.timestamp;
  let noLossDao = NoLossDao.bind(event.address);

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  if (voteManager == null) {
    let iteration = new Iteration(nextIterationId.toString());
    iteration.totalVotes = BigInt.fromI32(0);
    iteration.fundsDistributed = BigInt.fromI32(0);
    iteration.winningVotes = BigInt.fromI32(0);
    iteration.iterationNumber = BigInt.fromI32(0);
    iteration.projectVoteTallies = [];
    iteration.individualVotes = [];
    iteration.interestDistribution = [];
    iteration.iterationStartTimestamp = timeStamp;
    iteration.proposalDeadline = noLossDao.proposalDeadline();

    let voteManager = new VoteManager(VOTES_MANAGER_ENTITY_ID);
    voteManager.currentIteration = iteration.id;
    voteManager.totalDeposited = BigInt.fromI32(0);
    voteManager.totalDepositedUsers = BigInt.fromI32(0);
    voteManager.totalDepositedProjects = BigInt.fromI32(0);
    voteManager.numberOfUsers = BigInt.fromI32(0);
    voteManager.numberOfProjects = BigInt.fromI32(0);
    voteManager.votingInterval = noLossDao.votingInterval();

    iteration.save();
    voteManager.save();

    return;
  }

  let completeIteration = Iteration.load(voteManager.currentIteration);
  voteManager.latestCompleteIteration = completeIteration.id;
  completeIteration.iterationEndTimestamp = timeStamp;
  completeIteration.minerAddress = miner;
  completeIteration.save();

  let currentIteration = new Iteration(nextIterationId.toString());
  currentIteration.totalVotes = BigInt.fromI32(0);
  currentIteration.fundsDistributed = BigInt.fromI32(0);
  currentIteration.winningVotes = BigInt.fromI32(0);
  currentIteration.proposalDeadline = noLossDao.proposalDeadline();
  currentIteration.iterationNumber = completeIteration.iterationNumber.plus(
    BigInt.fromI32(1)
  );
  currentIteration.projectVoteTallies = [];
  currentIteration.individualVotes = [];
  currentIteration.interestDistribution = [];
  currentIteration.iterationStartTimestamp = timeStamp;
  currentIteration.save();

  voteManager.currentIteration = currentIteration.id;
  voteManager.save();
}

export function handleIterationWinner(event: IterationWinner): void {
  // Load Variables
  let iterationId = event.params.propsalIteration;
  let topProject = event.params.projectId; //uint of project
  let topProjectAddress = event.params.winner;
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let voteStatusId = iterationId.toString() + "-" + topProject.toString();
  let winner = VoteStatus.load(voteStatusId);

  // Perform logic and updates
  let previousIteration = Iteration.load(voteManager.currentIteration);
  previousIteration.winningProposal = topProject.toString();
  previousIteration.winningVotes = winner.projectVote;

  let project = Project.load(topProject.toString());
  project.iterationsWon = project.iterationsWon.concat([
    voteManager.currentIteration,
  ]);

  // Save results
  project.save();
  previousIteration.save();
}

export function handleVoteDelegated(event: VoteDelegated): void {
  let userAddress = event.params.user;
  let proxyAddress = event.params.delegatedTo;

  let user = User.load(userAddress.toHexString());

  user.proxyAddress = proxyAddress;
  user.save();
}

export function handleVotedDirect(event: VotedDirect): void {
  let voter = event.params.user;
  let proposalId = event.params.proposalId;
  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let iterationNo = voteManager.currentIteration;
  let voteStatusId = iterationNo + "-" + proposalId.toString();
  let uniqueVoteId =
    iterationNo + "-" + proposalId.toString() + "-" + voter.toHexString();

  let timeStamp = event.block.timestamp;

  let currentIteration = Iteration.load(iterationNo);
  let user = User.load(voter.toHexString());
  let newVote = new Vote(uniqueVoteId);

  newVote.voteAmount = user.amount;
  newVote.voter = user.id;
  newVote.timestamp = timeStamp;
  newVote.iterationOfVote = iterationNo;
  user.votes = user.votes.concat([uniqueVoteId]);
  user.lastIterationVoted = currentIteration.iterationNumber;
  currentIteration.individualVotes = currentIteration.individualVotes.concat([
    uniqueVoteId,
  ]);

  let project = Project.load(proposalId.toString());

  let voteStatus = VoteStatus.load(voteStatusId);
  if (voteStatus == null) {
    voteStatus = new VoteStatus(voteStatusId);
    voteStatus.projectVote = user.amount;
    voteStatus.iterationOfVoteTally = iterationNo;
    currentIteration.projectVoteTallies = currentIteration.projectVoteTallies.concat(
      [voteStatusId]
    );
    project.projectVoteResults = project.projectVoteResults.concat([
      voteStatusId,
    ]);
  } else {
    voteStatus.projectVote = voteStatus.projectVote.plus(user.amount);
  }
  currentIteration.totalVotes = currentIteration.totalVotes.plus(user.amount);

  voteStatus.save();
  project.save();
  newVote.save();
  user.save();
  currentIteration.save();
}

export function handleVotedViaProxy(event: VotedViaProxy): void {
  let voter = event.params.user;
  let proxy = event.params.proxy;
  let proposalId = event.params.proposalId;

  let voteManager = VoteManager.load(VOTES_MANAGER_ENTITY_ID);
  let iterationNo = voteManager.currentIteration;
  let voteStatusId = iterationNo + "-" + proposalId.toString();
  let uniqueVoteId =
    iterationNo + "-" + proposalId.toString() + "-" + voter.toHexString();

  let currentIteration = Iteration.load(iterationNo);
  let user = User.load(voter.toHexString());
  let newVote = new Vote(uniqueVoteId);

  newVote.voteAmount = user.amount;
  newVote.voter = user.id;
  newVote.proxyVoteAddress = proxy;
  newVote.iterationOfVote = iterationNo;

  user.votes = user.votes.concat([uniqueVoteId]);
  user.lastIterationVoted = currentIteration.iterationNumber;
  currentIteration.individualVotes = currentIteration.individualVotes.concat([
    uniqueVoteId,
  ]);

  let project = Project.load(proposalId.toString());

  let voteStatus = VoteStatus.load(voteStatusId);
  if (voteStatus == null) {
    voteStatus = new VoteStatus(voteStatusId);
    voteStatus.projectVote = user.amount;
    voteStatus.iterationOfVoteTally = iterationNo;
    currentIteration.projectVoteTallies = currentIteration.projectVoteTallies.concat(
      [voteStatusId]
    );
    project.projectVoteResults = project.projectVoteResults.concat([
      voteStatusId,
    ]);
  } else {
    voteStatus.projectVote = voteStatus.projectVote.plus(user.amount);
  }
  currentIteration.totalVotes = currentIteration.totalVotes.plus(user.amount);

  voteStatus.save();
  project.save();
  newVote.save();
  user.save();
  currentIteration.save();
}

export function handleProposalActive(event: ProposalActive): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());
  if (project == null) {
    return; // this will happen on project creation. In this case, poolDeposits will handle creation
  }
  project.projectState = "Active";
  //Failed to handle Ethereum event with handler "handleProposalActive": Mapping aborted at generated/schema.ts, line 23, column 4, with message: Cannot save Project entity without an ID, code: SubgraphSyncingFailure, id: QmZgLYsv2oEoUE3kVG21bk9w7tPTmKL5Ckg3a3ipSfeRnc
  project.save(); //Breaks If I try save, says cannot save entity without an ID.
}

export function handleProposalCooldown(event: ProposalCooldown): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());

  project.projectState = "Cooldown";
  project.save();
}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {
  let projectId = event.params.proposalId;
  let project = Project.load(projectId.toString());

  project.projectState = "Withdrawn";
  project.save();
}

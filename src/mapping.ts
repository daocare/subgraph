import { BigInt } from "@graphprotocol/graph-ts"
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
} from "../generated/Contract/Contract"
import { ExampleEntity } from "../generated/schema"

export function handleDepositAdded(event: DepositAdded): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.user = event.params.user
  entity.amount = event.params.amount

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.aaveLendingContract(...)
  // - contract.aaveLendingContractCore(...)
  // - contract.adaiContract(...)
  // - contract.admin(...)
  // - contract.daiContract(...)
  // - contract.depositedDai(...)
  // - contract.emergencyVoteAmount(...)
  // - contract.emergencyVoted(...)
  // - contract.isEmergencyState(...)
  // - contract.noLossDaoContract(...)
  // - contract.proposalAmount(...)
  // - contract.timeJoined(...)
  // - contract.totalDepositedDai(...)
  // - contract.createProposal(...)
}

export function handleDepositWithdrawn(event: DepositWithdrawn): void {}

export function handleEmergencyStateReached(
  event: EmergencyStateReached
): void {}

export function handleEmergencyVote(event: EmergencyVote): void {}

export function handleEmergencyWithdrawl(event: EmergencyWithdrawl): void {}

export function handleProposalAdded(event: ProposalAdded): void {}

export function handleProposalWithdrawn(event: ProposalWithdrawn): void {}

export function handleRemoveEmergencyVote(event: RemoveEmergencyVote): void {}

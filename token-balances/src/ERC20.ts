import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../generated/ERC20Factory/ERC20"
import {
  getOrCreateAccount,
  getOrCreateERC20Token,
  getOrCreateBalance
} from "./common"

export function handleTransfer(event: Transfer): void {
  if (event.params.value == BigInt.fromI32(0)) {
    return
  }

  getOrCreateERC20Token(event, event.address)
  let accountFrom = getOrCreateAccount(event.params.from)
  let accountTo = getOrCreateAccount(event.params.to)

  // log.warning("Transfer {} tokens from {} to {} on {}", [event.params.value.toString(), event.params.from.toHexString(), event.params.to.toHexString(), event.transaction.hash.toHexString()]);
  
  let balanceFrom = getOrCreateBalance(event.params.from, event.address)

  if (balanceFrom != null) {
    //log.warning("Current balance from {} is {} future balance is {} and value {}", [event.params.from.toHexString(), balanceFrom.balance.toString(), balanceFrom.balance.minus(event.params.value).toString(), event.params.value.toString()]);
    balanceFrom.balance = balanceFrom.balance.minus(event.params.value)
    balanceFrom.blockNumber = event.block.number
    balanceFrom.timestamp = event.block.timestamp
    balanceFrom.account = accountFrom.id
    balanceFrom.save()
  }

  let balanceTo = getOrCreateBalance(event.params.to, event.address)
  if (balanceTo != null) {
    //log.warning("Current balance to {} is {} future balance is {} and value {}", [event.params.to.toHexString(), balanceTo.balance.toString(), balanceTo.balance.plus(event.params.value).toString(), event.params.value.toString()]);
    balanceTo.balance = balanceTo.balance.plus(event.params.value)
    balanceTo.blockNumber = event.block.number
    balanceTo.timestamp = event.block.timestamp
    balanceTo.account = accountTo.id
    balanceTo.save()
  }
}

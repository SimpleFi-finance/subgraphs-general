import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import {
  Account,
  Balance,
  Token,
} from "../generated/schema"
import { ERC20 } from "../generated/ERC20Factory/ERC20"
import { PositionType, TokenStandard, TransactionType } from "./constants"


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export function getOrCreateAccount(address: Address): Account {
  let addressHex = address.toHexString()
  let account = Account.load(addressHex)
  if (account != null) {
    return account as Account
  }

  account = new Account(addressHex)
  account.save()
  return account as Account
}

export function getOrCreateBalance(account: Address, token: Address): Balance | null {
  let accountHex = account.toHexString()
  if (accountHex == ADDRESS_ZERO) {
    return null
  }
  let tokenHex = token.toHexString()
  let balance = Balance.load(tokenHex + "|" + accountHex)
  if (balance != null) {
    return balance as Balance
  }

  balance = new Balance(tokenHex + "|" + accountHex)
  balance.balance = BigInt.fromI32(0)
  balance.blockNumber = BigInt.fromI32(0)
  balance.timestamp = BigInt.fromI32(0)
  balance.account = accountHex
  balance.save()
  return balance as Balance
}

export function getOrCreateERC20Token(event: ethereum.Event, address: Address): Token {
  let addressHex = address.toHexString()
  let token = Token.load(addressHex)
  if (token != null) {
    return token as Token
  }

  token = new Token(addressHex)
  token.tokenStandard = TokenStandard.ERC20
  let tokenInstance = ERC20.bind(address)
  let tryName = tokenInstance.try_name()
  if (!tryName.reverted) {
    token.name = tryName.value
  }
  let trySymbol = tokenInstance.try_symbol()
  if (!trySymbol.reverted) {
    token.symbol = trySymbol.value
  }
  let tryDecimals = tokenInstance.try_decimals()
  if (!tryDecimals.reverted) {
    token.decimals = tryDecimals.value
  }
  token.blockNumber = event.block.number
  token.timestamp = event.block.timestamp
  token.save()
  return token as Token
}

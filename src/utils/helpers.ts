import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ForgeDiamond } from "../../generated/ForgeDiamond/ForgeDiamond";
import { Account, ForgeQueueItem, Gotchi, Item } from "../../generated/schema";
import { ItemSmelted, ItemForged } from "../../generated/schema";
import { BIGINT_ONE, BIGINT_ZERO, FORGE_DIAMOND } from "./constants";

export function getOrCreateAccount(addr: Address): Account {
  let account = Account.load(addr);
  if (!account) {
    account = new Account(addr);
    account.totalItemsForged = BIGINT_ZERO;
    account.totalItemsSmelted = BIGINT_ZERO;
    account.save();
  }
  return account;
}

export function getOrCreateGotchi(gotchiId: BigInt): Gotchi {
  let gotchi = Gotchi.load(gotchiId.toString());
  if (!gotchi) {
    gotchi = new Gotchi(gotchiId.toString());
    gotchi.totalItemsForged = BIGINT_ZERO;
    gotchi.totalItemsSmelted = BIGINT_ZERO;
    gotchi.skillPoints = 0;
    gotchi.smithingLevel = 0;
    gotchi.levelMultiplier = 1000;
    gotchi.save();
  }
  return gotchi;
}

export function getOrCreateItem(itemId: BigInt): Item {
  let item = Item.load(itemId.toString());
  if (!item) {
    item = new Item(itemId.toString());
    item.timesSmelted = BIGINT_ZERO;
    item.timesForged = BIGINT_ZERO;
    item.save();
  }
  return item;
}

export function getOrCreateForgeQueueItem(
  queueId: BigInt,
  itemId: BigInt,
  gotchiId: BigInt
): ForgeQueueItem {
  const forgeQueueItemId =
    gotchiId.toString() + "-" + itemId.toString() + "-" + queueId.toString();

  let forgeQueueItem = ForgeQueueItem.load(forgeQueueItemId);
  if (!forgeQueueItem) {
    forgeQueueItem = new ForgeQueueItem(forgeQueueItemId);
    forgeQueueItem.queueId = queueId;
    forgeQueueItem.item = itemId.toString();
    forgeQueueItem.gotchi = gotchiId.toString();
    forgeQueueItem.readyBlock = BIGINT_ZERO;
    forgeQueueItem.isClaimed = false;
  }
  return forgeQueueItem;
}

export function getGotchiSkillPoints(gotchiId: BigInt): number {
  const forgeContract = ForgeDiamond.bind(Address.fromString(FORGE_DIAMOND));
  const res0 = forgeContract.try_getAavegotchiSmithingSkillPts(gotchiId);
  if (!res0.reverted) {
    return res0.value.toU32();
  }
  return 0;
}

export function getSmithingLevel(skillPoints: number): number {
  const sequence = [
    0,
    16,
    38,
    69,
    113,
    174,
    259,
    378,
    544,
    776,
    1100,
    1554,
    2189,
    3078,
    4323,
    6066,
    8506,
    11922,
    16704,
    23398,
    32769,
    45889,
    64256,
    89970,
    125970,
    176369,
    246928,
    345710,
    484004,
    677616,
  ];

  if (skillPoints > sequence[sequence.length - 1]) {
    return sequence.length;
  }

  let level = 0;
  for (let i = 0; i < sequence.length; i++) {
    if (skillPoints >= sequence[i]) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

export function getOrCreateItemSmelted(
  event: ethereum.Event,
  itemId: BigInt,
  gotchiId: BigInt
): ItemSmelted {
  const id =
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toHexString();

  let itemSmelted = ItemSmelted.load(id);
  if (!itemSmelted) {
    itemSmelted = new ItemSmelted(id);
    itemSmelted.timestamp = event.block.timestamp;
    itemSmelted.txHash = event.transaction.hash;
    itemSmelted.item = itemId.toString();
    itemSmelted.gotchi = gotchiId.toString();
    itemSmelted.save();
  }
  return itemSmelted;
}

export function getOrCreateItemForged(
  event: ethereum.Event,
  itemId: BigInt,
  gotchiId: BigInt
): ItemForged {
  const id =
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toHexString();

  let itemForged = ItemForged.load(id);
  if (!itemForged) {
    itemForged = new ItemForged(id);
    itemForged.timestamp = event.block.timestamp;
    itemForged.txHash = event.transaction.hash;
    itemForged.item = itemId.toString();
    itemForged.gotchi = gotchiId.toString();
    itemForged.save();
  }
  return itemForged;
}

export function customHandleItemForged(
  event: ethereum.Event,
  gotchiId: BigInt,
  itemId: BigInt
): void {
  const account = getOrCreateAccount(event.transaction.from);
  account.totalItemsForged = account.totalItemsForged.plus(BIGINT_ONE);
  account.save();

  const skillPoints = getGotchiSkillPoints(gotchiId);
  const smithingLevel = getSmithingLevel(skillPoints);

  const gotchi = getOrCreateGotchi(gotchiId);
  gotchi.totalItemsForged = gotchi.totalItemsForged.plus(BIGINT_ONE);

  gotchi.skillPoints = skillPoints as i32;
  gotchi.smithingLevel = smithingLevel as i32;
  gotchi.save();

  const item = getOrCreateItem(itemId);
  item.timesForged = item.timesForged.plus(BIGINT_ONE);
  item.save();
}

import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  ForgeDiamond,
  AddedToQueue,
  ForgeQueueClaimed,
  ForgeTimeReduced,
  ItemForged,
  ItemSmelted,
  QueueTimeReduced,
  TransferBatch,
  TransferSingle,
  GeodeWin,
  SetGeodePrizes,
  GeodeEmpty,
  VrfResponse,
  GeodeRefunded,
} from "../generated/ForgeDiamond/ForgeDiamond";
import { BIGINT_ONE, BIGINT_ZERO, FORGE_DIAMOND } from "./utils/constants";

import {
  GeodeDraw,
  GeodePrize,
  GeodeRefund,
  VrfRequestResponse,
} from "../generated/schema";

import {
  customHandleItemForged,
  getGotchiSkillPoints,
  getOrCreateAccount,
  getOrCreateForgeQueueItem,
  getOrCreateGotchi,
  getOrCreateItem,
  getOrCreateItemForged,
  getOrCreateItemSmelted,
  getSmithingLevel,
} from "./utils/helpers";

export function handleAddedToQueue(event: AddedToQueue): void {
  const forgeQueueItem = getOrCreateForgeQueueItem(
    event.params.queueId,
    event.params.itemId,
    event.params.gotchiId
  );
  forgeQueueItem.readyBlock = event.params.readyBlock;
  forgeQueueItem.isClaimed = false;
  forgeQueueItem.save();
}

export function handleForgeQueueClaimed(event: ForgeQueueClaimed): void {
  /// NOTE::::: Also need access to forgeQueueItem queue ID for maintaining ForgeQueueItem
  const forgeDiamond = ForgeDiamond.bind(Address.fromString(FORGE_DIAMOND));
  const res0 = forgeDiamond.try_getForgeQueueItem(event.params.gotchiId);
  if (!res0.reverted) {
    const queueItem = res0.value;
    const forgeQueueItem = getOrCreateForgeQueueItem(
      queueItem.id,
      queueItem.itemId,
      queueItem.gotchiId
    );
    forgeQueueItem.readyBlock = queueItem.readyBlock;
    forgeQueueItem.isClaimed = queueItem.claimed;
    forgeQueueItem.save();
  }

  // As handleItemForged event is not being emitted, we need to track forge details using
  // `ForgeQueueClaimed` and `ForgeTimeReduced` events
  customHandleItemForged(event, event.params.gotchiId, event.params.itemId);

  // Item Forged is created when the forge is complete
  getOrCreateItemForged(event, event.params.itemId, event.params.gotchiId);
}

// This event is only being called once inside _forge() function when the item is forged immediately
// using GLTR tokens. Hence no queue is created and readyBlock is set to zero
export function handleForgeTimeReduced(event: ForgeTimeReduced): void {
  const forgeQueueItem = getOrCreateForgeQueueItem(
    event.params.queueId,
    event.params.itemId,
    event.params.gotchiId
  );

  // Item Forged is created when the forge is complete
  getOrCreateItemForged(event, event.params.itemId, event.params.gotchiId);

  forgeQueueItem.readyBlock = BIGINT_ZERO;
  forgeQueueItem.isClaimed = true;
  forgeQueueItem.save();

  // As handleItemForged event is not being emitted, we need to track forge details using
  // `ForgeQueueClaimed` and `ForgeTimeReduced` events
  customHandleItemForged(event, event.params.gotchiId, event.params.itemId);
}

export function handleItemForged(event: ItemForged): void {
  // This event is not being emitted in the contract
}

export function handleItemSmelted(event: ItemSmelted): void {
  const account = getOrCreateAccount(event.transaction.from);
  account.totalItemsSmelted = account.totalItemsSmelted.plus(BIGINT_ONE);
  account.save();

  const skillPoints = getGotchiSkillPoints(event.params.gotchiId);
  const smithingLevel = getSmithingLevel(skillPoints);

  const gotchi = getOrCreateGotchi(event.params.gotchiId);
  gotchi.totalItemsSmelted = gotchi.totalItemsSmelted.plus(BIGINT_ONE);
  gotchi.skillPoints = skillPoints as i32;
  gotchi.smithingLevel = smithingLevel as i32;
  gotchi.save();

  const item = getOrCreateItem(event.params.itemId);
  item.timesSmelted = item.timesSmelted.plus(BIGINT_ONE);
  item.save();

  getOrCreateItemSmelted(event, event.params.itemId, event.params.gotchiId);
}

export function handleQueueTimeReduced(event: QueueTimeReduced): void {
  const forgeDiamond = ForgeDiamond.bind(Address.fromString(FORGE_DIAMOND));
  const res0 = forgeDiamond.try_getForgeQueueItem(event.params.gotchiId);
  if (!res0.reverted) {
    const queueItem = res0.value;
    const forgeQueueItem = getOrCreateForgeQueueItem(
      queueItem.id,
      queueItem.itemId,
      queueItem.gotchiId
    );
    forgeQueueItem.readyBlock = queueItem.readyBlock;
    forgeQueueItem.isClaimed = queueItem.claimed;
    forgeQueueItem.save();
  }
}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {}

export function handleSetGeodePrizes(event: SetGeodePrizes): void {
  let geodeIds = event.params.ids;
  let quantities = event.params.quantities;

  for (let i = 0; i < geodeIds.length; i++) {
    let geodePrize = GeodePrize.load(geodeIds.at(i).toString());
    if (!geodePrize) {
      geodePrize = new GeodePrize(geodeIds.at(i).toString());
      geodePrize.quantity = quantities.at(i);
      geodePrize.timesWon = BIGINT_ZERO;
      geodePrize.timesEmpty = BIGINT_ZERO;
      geodePrize.save();
    }
  }
}

export function handleGeodeWin(event: GeodeWin): void {
  const id =
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toHexString();

  let geodeDraw = GeodeDraw.load(id);
  if (!geodeDraw) {
    geodeDraw = new GeodeDraw(id);
    geodeDraw.user = getOrCreateAccount(event.params.user).id;
    geodeDraw.itemWon = getOrCreateItem(event.params.itemId).id;
    geodeDraw.geodeTokenId = event.params.geodeTokenId;
    geodeDraw.requestId = event.params.requestId;
    geodeDraw.blockNumber = event.params.blockNumber;
    geodeDraw.save();
  }

  // Increment the count this item has been won
  let geodePrize = GeodePrize.load(event.params.geodeTokenId.toString());
  if (geodePrize) {
    geodePrize.timesWon = geodePrize.timesWon.plus(BIGINT_ONE);
    geodePrize.save();
  }
}

export function handleGeodeEmpty(event: GeodeEmpty): void {
  const id =
    event.transaction.hash.toHexString() +
    "-" +
    event.transactionLogIndex.toHexString();

  let geodeDraw = GeodeDraw.load(id);
  if (!geodeDraw) {
    geodeDraw = new GeodeDraw(id);
    geodeDraw.user = getOrCreateAccount(event.params.user).id;
    geodeDraw.itemWon = null;
    geodeDraw.geodeTokenId = event.params.geodeTokenId;
    geodeDraw.requestId = event.params.requestId;
    geodeDraw.blockNumber = event.params.blockNumber;
    geodeDraw.save();
  }

  // Increment the count this item has been drawn but was empty
  let geodePrize = GeodePrize.load(event.params.geodeTokenId.toString());
  if (geodePrize) {
    geodePrize.timesEmpty = geodePrize.timesEmpty.plus(BIGINT_ONE);
    geodePrize.save();
  }
}
export function handleVrfResponse(event: VrfResponse): void {
  let id =
    event.transaction.hash.toString() +
    "-" +
    event.transactionLogIndex.toString() +
    "-" +
    event.params.requestId.toString();
  let vrfReqRes = VrfRequestResponse.load(id);
  if (!vrfReqRes) {
    vrfReqRes = new VrfRequestResponse(id.toString());
    vrfReqRes.requestId = event.params.requestId;
    vrfReqRes.user = getOrCreateAccount(event.params.user).id;
    vrfReqRes.randomNumber = event.params.randomNumber;
    vrfReqRes.blockNumber = event.params.blockNumber;
    vrfReqRes.save();
  }
}

export function handleGeodeRefunded(event: GeodeRefunded): void {
  let id = event.transaction.hash.toString() + "-" + event.transactionLogIndex.toString();
  let geodeRefund = GeodeRefund.load(id);
  if (!geodeRefund) {
    geodeRefund = new GeodeRefund(id);
    geodeRefund.user = getOrCreateAccount(event.params.user).id;
    geodeRefund.geodeTokenId = event.params.geodeTokenId;
    geodeRefund.requestId = event.params.requestId;
    geodeRefund.blockNumber = event.params.blockNumber;
    geodeRefund.save();
  }
}

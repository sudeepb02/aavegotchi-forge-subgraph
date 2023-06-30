import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AddedToQueue,
  ForgeQueueClaimed,
  ForgeTimeReduced,
  ItemForged,
  ItemSmelted,
  QueueTimeReduced,
  TransferBatch,
  TransferSingle
} from "../generated/ForgeDiamond/ForgeDiamond"

export function createAddedToQueueEvent(
  owner: Address,
  itemId: BigInt,
  gotchiId: BigInt,
  readyBlock: BigInt,
  queueId: BigInt
): AddedToQueue {
  let addedToQueueEvent = changetype<AddedToQueue>(newMockEvent())

  addedToQueueEvent.parameters = new Array()

  addedToQueueEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  addedToQueueEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  addedToQueueEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )
  addedToQueueEvent.parameters.push(
    new ethereum.EventParam(
      "readyBlock",
      ethereum.Value.fromUnsignedBigInt(readyBlock)
    )
  )
  addedToQueueEvent.parameters.push(
    new ethereum.EventParam(
      "queueId",
      ethereum.Value.fromUnsignedBigInt(queueId)
    )
  )

  return addedToQueueEvent
}

export function createForgeQueueClaimedEvent(
  itemId: BigInt,
  gotchiId: BigInt
): ForgeQueueClaimed {
  let forgeQueueClaimedEvent = changetype<ForgeQueueClaimed>(newMockEvent())

  forgeQueueClaimedEvent.parameters = new Array()

  forgeQueueClaimedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  forgeQueueClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )

  return forgeQueueClaimedEvent
}

export function createForgeTimeReducedEvent(
  queueId: BigInt,
  gotchiId: BigInt,
  itemId: BigInt,
  _blocksReduced: BigInt
): ForgeTimeReduced {
  let forgeTimeReducedEvent = changetype<ForgeTimeReduced>(newMockEvent())

  forgeTimeReducedEvent.parameters = new Array()

  forgeTimeReducedEvent.parameters.push(
    new ethereum.EventParam(
      "queueId",
      ethereum.Value.fromUnsignedBigInt(queueId)
    )
  )
  forgeTimeReducedEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )
  forgeTimeReducedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  forgeTimeReducedEvent.parameters.push(
    new ethereum.EventParam(
      "_blocksReduced",
      ethereum.Value.fromUnsignedBigInt(_blocksReduced)
    )
  )

  return forgeTimeReducedEvent
}

export function createItemForgedEvent(
  itemId: BigInt,
  gotchiId: BigInt
): ItemForged {
  let itemForgedEvent = changetype<ItemForged>(newMockEvent())

  itemForgedEvent.parameters = new Array()

  itemForgedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  itemForgedEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )

  return itemForgedEvent
}

export function createItemSmeltedEvent(
  itemId: BigInt,
  gotchiId: BigInt
): ItemSmelted {
  let itemSmeltedEvent = changetype<ItemSmelted>(newMockEvent())

  itemSmeltedEvent.parameters = new Array()

  itemSmeltedEvent.parameters.push(
    new ethereum.EventParam("itemId", ethereum.Value.fromUnsignedBigInt(itemId))
  )
  itemSmeltedEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )

  return itemSmeltedEvent
}

export function createQueueTimeReducedEvent(
  gotchiId: BigInt,
  reducedBlocks: BigInt
): QueueTimeReduced {
  let queueTimeReducedEvent = changetype<QueueTimeReduced>(newMockEvent())

  queueTimeReducedEvent.parameters = new Array()

  queueTimeReducedEvent.parameters.push(
    new ethereum.EventParam(
      "gotchiId",
      ethereum.Value.fromUnsignedBigInt(gotchiId)
    )
  )
  queueTimeReducedEvent.parameters.push(
    new ethereum.EventParam(
      "reducedBlocks",
      ethereum.Value.fromUnsignedBigInt(reducedBlocks)
    )
  )

  return queueTimeReducedEvent
}

export function createTransferBatchEvent(
  operator: Address,
  from: Address,
  to: Address,
  ids: Array<BigInt>,
  values: Array<BigInt>
): TransferBatch {
  let transferBatchEvent = changetype<TransferBatch>(newMockEvent())

  transferBatchEvent.parameters = new Array()

  transferBatchEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam("ids", ethereum.Value.fromUnsignedBigIntArray(ids))
  )
  transferBatchEvent.parameters.push(
    new ethereum.EventParam(
      "values",
      ethereum.Value.fromUnsignedBigIntArray(values)
    )
  )

  return transferBatchEvent
}

export function createTransferSingleEvent(
  operator: Address,
  from: Address,
  to: Address,
  id: BigInt,
  value: BigInt
): TransferSingle {
  let transferSingleEvent = changetype<TransferSingle>(newMockEvent())

  transferSingleEvent.parameters = new Array()

  transferSingleEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  transferSingleEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferSingleEvent
}

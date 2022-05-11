import { BigNumber } from 'ethers'
import { Grant } from '../../reducers/grants'

type GrantArgs = string | {
  type: string;
  hex: string;
}
interface GrantEvent {
  event: string
  args: GrantArgs[]
}
export const parseMintEvents = (events: GrantEvent[]): Grant | Error => {
  const createdEvent = events.find(event => event.event === 'GrantCreated')
  if (!createdEvent) {
    throw new Error('Unable to find created event')
  }

  return {
    id: BigNumber.from(createdEvent?.args[0]).toNumber(),
    ipfsHash: createdEvent?.args[2].toString(),
    owner: createdEvent?.args[1].toString(),
  }
}

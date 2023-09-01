// Copyright (c) 2023 Algorealm, Inc.

import { BN, BN_ONE, BN_TWO } from "@polkadot/util";
import type { WeightV2 } from '@polkadot/types/interfaces'

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit: BN = new BN(1000);

export async function getSubscribedNodes(contract: any, api: any, account: any, did: string): Promise<any> {
  const { result, output } = await contract.query.getSubscribers(
    account.address,
    {
      gasLimit: api?.registry.createType('WeightV2', {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as WeightV2,
      storageDepositLimit,
    },
    did
  );

  return result.toHuman();
}
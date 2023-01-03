// imports
import * as Kilt from '@kiltprotocol/sdk-js'
import { mnemonicGenerate, cryptoWaitReady, blake2AsHex, xxhashAsHex, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import axios from 'axios'

const keyring = new Keyring({ type: 'sr25519' });
const sam = keyring.createFromUri("yellow obscure salmon affair extra six bubble clutch fly bread away tired", 'sr25519');
let api = undefined;

export async function connect() {
    try {
        // set up the samaritan test account
        api = await Kilt.connect('wss://peregrine.kilt.io/parachain-public-ws');
    } catch (e) {
        return false;
    }

    return true;
}
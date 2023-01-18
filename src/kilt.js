// imports
import * as Kilt from '@kiltprotocol/sdk-js'
import { mnemonicGenerate, cryptoWaitReady, blake2AsHex, xxhashAsHex, mnemonicToMiniSecret } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import axios from 'axios'

const keyring = new Keyring({ type: 'sr25519' });
let sam = "";
let api = undefined;

cryptoWaitReady().then(() => {
    sam = keyring.createFromUri("yellow obscure salmon affair extra six bubble clutch fly bread away tired", 'sr25519');
});

export async function connect() {
    try {
        // set up the samaritan test account
        // api = await Kilt.connect('wss://peregrine.kilt.io/parachain-public-ws');
        api = await Kilt.connect('wss://spiritnet.kilt.io/');
    } catch (e) {
        return false;
    }

    return true;
}

export async function createKiltLightDID() {
    const keyring = new Keyring({ type: 'sr25519' });
    const mnemonic = mnemonicGenerate();
    const auth = keyring.createFromUri(mnemonic, 'sr25519');
    const service = [
        {
            id: '#claims-repo',
            type: ['KiltPublishedCredentialCollectionV1'],
            serviceEndpoint: [],
        },
    ];
    // Create a light DID from the generated authentication key.
    const lightDID = Kilt.Did.createLightDidDocument({
        authentication: [auth],
        service
    })
    
    return lightDID;
}
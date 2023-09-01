// Copyright (c) 2023 Algorealm, Inc.

// imports
import WebSocket from 'ws';
import { blake2AsHex } from '@polkadot/util-crypto';

// blockchain essentials
import { ApiPromise, WsProvider } from '@polkadot/api';
import { mnemonicGenerate, cryptoWaitReady, blake2AsHex } from '@polkadot/util-crypto';
const { Keyring } = require('@polkadot/keyring');
import { ContractPromise } from '@polkadot/api-contract';

// blockchain config
const wsProvider = new WsProvider('wss://rococo-contracts-rpc.polkadot.io');
const node = await ApiPromise.create({ provider: wsProvider });
const keyring = new Keyring({ type: 'sr25519' });

// local imports
import * as chain from "./contract.cjs";
import * as meta from "./metadata.js";

// constants
const SAM_DB_LISTENING_PORT = 2027;
const CONTRACT_ADDRESS = "5D9k4NNFqniNX8fUQ8N3hYdu336Dnievx4JFRjKuDuYGvvmN";
// contains no balance, only used to read state of contract
const MNEMONICS = "dilemma quarter decrease simple climb boring liberty tobacco upper axis neutral suit";
const SamOS = keyring.createFromUri(MNEMONICS, 'sr25519');
const contract = new ContractPromise(api, meta.metadata(), CONTRACT_ADDRESS);

async function sendMessage(ws, message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return null; // Or handle the error condition as appropriate
    }

    return new Promise((resolve, reject) => {
        ws.send(message);
        ws.addEventListener('message', (response) => {
            try {
                const parsedResponse = JSON.parse(response.data);
                resolve(parsedResponse);
            } catch (error) {
                reject(error);
            }
        });
    });
}

const
    api = {
        connect: async (did) => {
            // we need to get the address of the nodes running the application
            let nodeAddresses = await chain.getSubscribedNodes(node, contract, SamOS, did);
            console.log(nodeAddresses);

            // select randomly and try to connect, else pick another
            let wsAddress = extractAndSelectRandomIp(nodeAddresses);

            if (wsAddress) {
                // then concatenate it with SamaritanDB default listening port
                wsAddress += `${SAM_DB_LISTENING_PORT}`;
                console.log(`Selected node "wsAddress" from contract`);

                try {
                    const ws = new WebSocket(wsAddress);

                    ws.addEventListener('error', (error) => {
                        console.error('WebSocket connection error:', error);
                    });

                    ws.addEventListener('open', () => {
                        console.log('WebSocket connection established');
                    });

                    return ws; // Return the WebSocket instance for further use
                } catch (error) {
                    console.error('WebSocket initialization error:', error);
                    throw error; // Rethrow the error to handle it at a higher level
                }
            } else {
                console.log(`Failed to find nodes that support application with DID: ${did}`);
            }
        },

        // Define the API for database operations
        db: {
            insert: async (ws, config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.values && (data.keys.length == data.values.length)) {
                        // concatenate the keys and values
                        let vector = [];
                        for (var i = 0; i < data.keys.length; i++) vector.push(data.keys[i]);
                        vector.push("::")   // this would serve as a separator between keys and values
                        for (var j = 0; j < data.values.length; j++) vector.push(data.values[j]);

                        const message = JSON.stringify({
                            did: data.app_did,
                            password: blake2AsHex(data.keys),   // the password is the hash of the keys
                            command: "insert",
                            data: vector,
                            sam_did: data.sam_did ?? ""
                        });

                        const response = await sendMessage(ws, message);
                        console.log(response);

                        // Parse the response
                        if (response.status == 200) {
                            if (callback) callback();
                        } else {
                            if (errorCallback) errorCallback();
                        }
                    } else {
                        throw new Error("Bad lexical composition of arguments");
                    }
                }
            },
            get: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.keys.length) {
                        // concatenate the keys and values
                        let vector = [];
                        for (var i = 0; i < data.keys.length; i++) vector.push(data.keys[i]);

                        const message = JSON.stringify({
                            did: data.app_did,
                            password: blake2AsHex(data.keys),   // the password is the hash of the keys
                            command: "get",
                            data: vector,
                            sam_did: data.sam_did ?? ""
                        });

                        const response = await sendMessage(message);
                        console.log(response);
                        // Parse the response
                        if (response.status == 200) {
                            if (callback) callback(response.data.values);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        throw new Error("Bad lexical composition of arguments");
                    }
                }
            },
            del: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.keys.length) {
                        let vector = [];
                        for (var i = 0; i < data.keys.length; i++) vector.push(data.keys[i]);

                        const message = JSON.stringify({
                            did: data.app_did,
                            password: blake2AsHex(data.keys),   // the password is the hash of the keys
                            command: "del",
                            data: vector,
                            sam_did: data.sam_did ?? ""
                        });

                        // Parse the response
                        // Parse the response
                        if (response.status == 200) {
                            if (callback) callback();
                        } else {
                            if (errorCallback) errorCallback();
                        }
                    } else {
                        throw new Error("Bad lexical composition of arguments");
                    }
                }
            },
        },
    };

// helper functions
function configIsValid(config) {
    // check for the compliance of the config data
    if (config.did && config.keys) {
        // check for did
        if (config.did.indexOf("did:sam:apps:") != -1) {
            // check for the number of words
            if (config.keys.split(' ').length == 12) return true;
            else throw new Error("Invalid length of keys.");
        } else
            throw new Error("Incorrect application DID format.");
    } else
        throw new Error("Your configuration data is incomplete. Application DID or Key is missing.");
}

// This function is to select the closest node to the current client
// For now, it will just be selected at random
function extractAndSelectRandomIp(inputString) {
    const parts = inputString.split('$$$');
    const extractedData = [];

    for (const part of parts) {
        const match = part.match(/\/ip4\/([\d.]+)\/tcp\/\d+(\/p2p\/[a-z0-9]+)?/i);
        if (match) {
            const ipAddress = match[1];
            extractedData.push({ ipAddress });
        }
    }

    if (extractedData.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * extractedData.length);
    return extractedData[randomIndex].ipAddress;
}

// Export the API
export { api };
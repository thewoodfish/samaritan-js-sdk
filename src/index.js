// imports
import { response } from 'express';
import WebSocket from 'ws';
import { Keyring } from '@polkadot/keyring';

const keyring = new Keyring({ type: 'sr25519' });
let ws = undefined;

function initSamDB(wsAddress) {
    ws = new WebSocket(wsAddress);

    // Handle WebSocket connection errors
    ws.on('error', function (error) {
        console.error('WebSocket connection error:', error);
    });

    // Handle WebSocket connection success
    ws.on('open', function () {
        console.log('WebSocket connection established');
    });
}

async function sendMessage(message) {
    return new Promise((resolve, reject) => {
        ws.send(message);
        ws.once('message', (response) => {
            try {
                const parsedResponse = JSON.parse(response);
                resolve(parsedResponse);
            } catch (error) {
                reject(error);
            }
        });
    });
}

const
    api = {
        // Define the API for DID manipulation
        did: {
            new: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if ((data.type == "sam" || data.type == "app") && data.password) {
                    const message = `new::${data.type}::${data.password}`;
                    const response = await sendMessage(message);
                    // Parse the response
                    if (response.status == "ok") {
                        // handle the response
                        if (callback) callback(response.data);
                    } else {
                        if (errorCallback) errorCallback(response.data);
                    }
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: "bad input"
                        });
                    }
                }
            },
            // authenticate app or samaritan
            auth: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.sam_did && data.password) {
                        const message =
                            data.sam_did.includes("sam:root") ? `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~auth::${data.sam_did}::${data.password}`
                                : `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~init::${data.sam_did}::${data.password}`;
                        const response = await sendMessage(message);

                        // Parse the response
                        if (response.status == "ok") {
                            // handle the response
                            if (callback) callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            },
            // revoke the access of an app
            revoke: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.sam_did && data.app_did && (data.deny == true || data.deny == false)) {
                        const message =
                            data.deny ? `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~revoke::${data.sam_did}::${data.app_did}`
                                : `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~unrevoke::${data.sam_did}::${data.app_did}`;
                        const response = await sendMessage(message);
                        // Parse the response
                        if (response.status == "ok") {
                            // handle the response
                            if (callback) callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            }
        },

        // Define the API for database operations
        db: {
            insert: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.values && (data.keys.length == data.values.length)) {
                        // concatenate the keys and values
                        let keys = "";
                        let values = "";
                        for (var i = 0; i < data.keys.length; i++) keys += `${data.keys[i]};`;
                        for (var j = 0; j < data.values.length; j++) values += `${data.values[j]};`;

                        const message = `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~insert::${data.app_did}::${keys.substring(0, keys.length - 1)}::${values.substring(0, values.length - 1)}${data.sam_did ? `::${data.sam_did}` : "" /*optional */}`;
                        const response = await sendMessage(message);

                        // Parse the response
                        if (response.status == "ok") {
                            const returnData = JSON.parse(JSON.stringify(response.data));
                            const output = JSON.parse(returnData['0']);
                            if (callback) callback({
                                output
                            });
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            },
            get: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.keys.length) {
                        // concatenate the keys and values
                        let keys = "";
                        for (var i = 0; i < data.keys.length; i++) keys += `${data.keys[i]};`;

                        const message = `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~get::${data.app_did}::${keys.substring(0, keys.length - 1)}${data.sam_did ? `::${data.sam_did}` : "" /*optional */}`;
                        const response = await sendMessage(message);

                        // Parse the response
                        if (response.status == "ok") {
                            // make the data more dev-friendly
                            const returnData = JSON.parse(JSON.stringify(response.data));
                            const input = JSON.parse(returnData['0']);
                            const output = JSON.parse(returnData['1']);
                            if (callback) callback({
                                input,
                                output
                            });
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            },
            del: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did && data.keys && data.keys.length) {
                        // concatenate the keys and values
                        let keys = "";
                        for (var i = 0; i < data.keys.length; i++) keys += `${data.keys[i]};`;

                        const message = `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~del::${data.app_did}::${keys.substring(0, keys.length - 1)}${data.sam_did ? `::${data.sam_did}` : "" /*optional */}`;
                        const response = await sendMessage(message);
                        // Parse the response
                        if (response.status == "ok") {
                            // handle the response
                            const returnData = JSON.parse(JSON.stringify(response.data));
                            const input = JSON.parse(returnData['0']);
                            const output = JSON.parse(returnData['1']);
                            if (callback) callback({
                                input,
                                output
                            });
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            },
            getall: async (config, data, callback, errorCallback) => {
                // first check for config data
                if (configIsValid(config)) {
                    // check for lexical compliance
                    if (data.app_did) {
                        const message = `${config.did}::${keyring.createFromUri(config.keys, 'sr25519').address}~~getall::${data.app_did}${data.sam_did ? `::${data.sam_did}` : "" /*optional */}`;
                        const response = await sendMessage(message);
                        // Parse the response
                        if (response.status == "ok") {
                            // handle the response
                            if (callback) callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    } else {
                        if (errorCallback) {
                            // call the error callback
                            errorCallback({
                                msg: "bad input"
                            });
                        }
                    }
                }
            },
        },
    };

// helper functions
function configIsValid(config) {
    // check the for the compliance of the config data
    if (config.did && config.keys) {
        // check for did
        if (config.did.indexOf("did:sam:apps:") != -1) {
            // check for the number of words
            if (config.keys.split(' ').length == 12) return true;
            else throw new Error("Invalid length of keys.");
        } else
            throw new Error("Incorrect application DID format.");
    } else
        throw new Error("Your configuration data is incomplete. DID or Key is missing.");
}

// Export the API
export { api, initSamDB };
// imports
import WebSocket from 'ws';

const wsEndpoint = 'ws://127.0.0.1:1509';
const ws = new WebSocket(wsEndpoint);

// Handle WebSocket connection errors
ws.on('error', function (error) {
    console.error('WebSocket connection error:', error);
});

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

// Handle WebSocket connection success
ws.on('open', function () {
    console.log('WebSocket connection established');

    const api = {
        // Define the API for DID manipulation
        did: {
            new: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if ((data.type == "sam" || data.type == "app") && data.password) {
                    const message = `new::${data.type}::${data.password}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
            // authenticate app or samaritan
            auth: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.did && data.password) {
                    const message = `auth::${data.type}::${data.password}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
            // revoke the access of an app
            revoke: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.deny && data.password) {
                    const message =
                        data.deny ? `revoke::${data.sam_did}::${data.app_did}`
                            : `unrevoke::${data.type}::${data.password}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            }
        },

        // Define the API for database operations
        db: {
            insert: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.app_did && data.key && data.value) {
                    const message = `insert::${data.app_did}::${data.key}::${data.value}::${data.sam_did /*optional */}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
            get: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.app_did && data.key) {
                    const message = `get::${data.app_did}::${data.key}::${data.sam_did /*optional */}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
            del: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.app_did && data.key) {
                    const message = `del::${data.app_did}::${data.key}::${data.sam_did /*optional */}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
            getall: async (data, callback, errorCallback) => {
                // check for lexical compliance
                if (data.app_did) {
                    const message = `getall::${data.app_did}::${data.sam_did /*optional */}`;
                    const response = await sendMessage(message);
                    // process callback
                    if (callback) {
                        // Parse the response
                        const response = JSON.parse(response);
                        if (response.status == "ok") {
                            // handle the response
                            callback(response.data);
                        } else {
                            if (errorCallback) errorCallback(response.data);
                        }
                    }
                    return response;
                } else {
                    if (errorCallback) {
                        // call the error callback
                        errorCallback({
                            msg: ""
                        });
                    }
                }
            },
        },

    };

    // Export the API
    module.exports = api;
});
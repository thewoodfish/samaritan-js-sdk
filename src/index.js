// imports
import * as util from "./utility.js";
import * as kilt from "./kilt.js";
import * as dbs from "./database.js";

export class SamaritanSDK {
    // class variables
    connected = false;
    db_address = "";
    session_did = "";

    // connect to this address if custom address is not specified
    constructor(addr = "ws://127.0.0.1:1509") {
        this.db_address = addr;
    }

    setSession = (did) => {
        this.session_did = did;
    }

    getSession = (did) => {
        return this.session_did;
    }

    // initialize the library instance
    init = async () => {
        if (!this.connected) {
            console.log("initializing library...");
            if (await kilt.connect()) {
                if (await dbs.init(this.db_address)) {
                    this.connected = true;
                    return true;
                }
            }
        }
    }

    getResult = () => {
        let val = this.cache.msg;
        this.cache.msg = "";
        return val;
    }

    // ensure there is a connection to the server
    ensureConnection = () => {
        if (!this.connected)
            throw ("You need to initialize the SDK to continue");
        return true;
    }

    // ensure app is authenticated and initialized
    ensureDidInit = () => {
        if (!this.getSession()) {
            if (this.getSession().indexOf("app") != -1)
                throw ("You need to be authenticated before making any request");
        }
        return true;
    }

    did = {
        // create new samaritan
        createNew: async (name) => {
            if (!this.ensureConnection() && !name)
                throw (`To create a Samaritan, you must specify a name.`);

            return (async function () {
                // create a light DID from KILT
                let ldid = await kilt.createKiltLightDID();
                ldid["name"] = name;

                // construct the user data root
                let root = {
                    did_doc: ldid,
                    hash_table: {}
                };

                let result = await dbs.newSamaritan(JSON.stringify(root));

                // set session did
                this.setSession(result.did);

                return {
                    did: result.did,
                    keys: result.keys
                };
            })();
        },

        // request new API KEY for app
        newApiKey: async () => {
            return (async function () {
                let result = await dbs.newApiKey();
                return {
                    did: result.did,
                    keys: result.keys
                };
            })();
        },

        // authenticate app or samaritan
        auth: async (keys) => {
            let result = await dbs.auth_did(keys);
            // remember did
            this.session_did = result.did;
            return {
                exists: result.exists,
                did: result.did
            }
        },

        // revoke the access of an app
        revoke: async (did) => {
            if (!this.session_did || this.session_did.indexOf("app") != -1)
                throw ("You need to authenticate your samaritan before making any request");

            let result = await dbs.revoke(did, this.getSession());
            return result;
        }
    }

    // database entry
    db = {
        // insert into database
        insert: async (did, key, value) => {
            if (this.ensureDidInit()) {
                let result = await dbs.insertRecord(did, key, value, this.getSession());
                return result;
            }
        },

        // retreive from database
        get: async (did, key) => {
            if (this.ensureDidInit()) {
                let result = await dbs.getRecord(did, key, this.getSession());
                return result;
            }
        },

        // delete an entry in the database
        delete: async (did, key) => {
            if (this.ensureDidInit()) {
                let result = await dbs.delRecord(did, key, this.getSession());
                return result;
            }
        },
    }

}
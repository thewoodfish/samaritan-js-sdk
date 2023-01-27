// imports
import * as util from "./utility.js";
import * as kilt from "./kilt.js";
import * as dbs from "./database.js";

export class SamaritanSDK {
    connected = false;
    db_address = "";
    session_did = "";

    // for message delivery
    cache = {
        msg: ""
    }

    // connect to this address if custom address is not specified
    constructor(addr = "ws://127.0.0.1:1509") {
        this.db_address = addr;
    }

    // initialize the library instance
    init = async() => {
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

    get_result = () => {
        let val = this.cache.msg;
        this.cache.msg = "";

        return val;
    }

    // ensure there is a connection to the server
    ensure_connection = () => {
        if (!this.connected) 
            throw("You need to initialize the SDK to continue");

        return true; 
    }

    // ensure app is authenticated and initialized
    ensure_did_init = () => {
        if (!this.session_did) { 
            if (this.session_did.indexOf("app") != -1  )
                throw("You need to authenticate your app before making any request");
            else
                throw("You need to authenticate your samaritan before making any request");
        }
        return true; 
    }

    delay = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    did = {
        // create new samaritan
        create_new: async (name) => {
            if (!this.ensure_connection() && !name) 
                throw(`To create a Samaritan, you must specify a name.`);

            return (async function () {
                // create a light DID from KILT
                let ldid = await kilt.createKiltLightDID();
                ldid["name"] = name;

                // construct the user data root
                let root = {
                    did_doc: ldid,
                    hash_table: {}
                };

                let result = await dbs.new_samaritan(JSON.stringify(root));
                return {
                    did: result.did,
                    keys: result.keys
                };
            })();
        },

        // request new API KEY for app
        new_api_key: async () => {
            return (async function () {
                let result = await dbs.new_api_key();
                return {
                    did: result.did,
                    keys: result.keys
                };
            })();
        },

        // authenticate app or samaritan
        auth: async(keys) => {
            let result = await dbs.auth_did(keys);
            // remember did
            this.session_did = result.did;
            return {
                exists: result.exists,
                did: result.did
            }
        },

        // revoke the access of an app
        revoke: async(did) => {
            if (!this.session_did || this.session_did.indexOf("app") != -1 ) 
                throw("You need to authenticate your samaritan before making any request");

            let result = await dbs.revoke(did, this.session_did);
            return result;
        }
    }

    // database entry
    db = {
        // insert into database
        insert: async (did, key, value) => {
            if (this.ensure_did_init()) {
                let result = await dbs.insert_record(did, key, value, this.session_did);
                return result;
            }
        },

        // retreive from database
        get: async (did, key) => {
            if (this.ensure_did_init()) {
                let result = await dbs.get_record(did, key, this.session_did);
                return result;
            }
        },
        
        // delete an entry in the database
        delete: async (did, key) => {
            if (this.ensure_did_init()) {
                let result = await dbs.del_record(did, key, this.session_did);
                return result;
            }
        },
    }

}
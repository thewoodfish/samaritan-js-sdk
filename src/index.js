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
        create_new: async(name) => {
            if (!this.ensure_connection() && !name) 
                throw(`To create a Samaritan, you must specify a name.`);

            // create a light DID from KILT
            let ldid = await kilt.createKiltLightDID();
            ldid["name"] = name;

            // construct the user data root
            let root = {
                did_doc: ldid,
                hash_table: {}
            };

            await dbs.new_samaritan(JSON.stringify(root), this.cache);
            await this.delay(1000).then(() => {
                if (!this.cache.msg)
                    throw new Error("request timeout");
            });

            let result = this.get_result();
            return {
                did: result.did,
                keys: result.keys
            };
        },

        // request new API KEY for app
        new_api_key: async () => {
            await dbs.new_api_key(this.cache);
            await this.delay(1000).then(() => {
                if (!this.cache.msg)
                    throw new Error("request timeout");
            });

            let result = this.get_result();
            return {
                did: result.did,
                keys: result.keys
            };
        },

        // authenticate app or samaritan
        auth: async(keys) => {
            await dbs.auth_did(keys, this.cache);
            await this.delay(1000).then(() => {
                if (!this.cache.msg)
                    throw new Error("request timeout");
            });

            let result = this.get_result();

            // remember did
            this.session_did = result.did;
            return {
                exists: JSON.parse(result.exists),
                did: result.did
            }
        },

        // revoke the access of an app
        revoke: async(did) => {
            if (!this.session_did || this.session_did.indexOf("app") != -1 ) 
                throw("You need to authenticate your samaritan before making any request");

            await dbs.revoke(did, this.cache, this.session_did);
            await this.delay(1000).then(() => {
                if (!this.cache.msg)
                    throw new Error("request timeout");
            });

            return this.get_result();
        }
    }

    // database entry
    db = {
        // insert into database
        insert: async (did, key, value) => {
            if (this.ensure_did_init()) {
                await dbs.insert_record(did, key, value, this.cache, this.session_did);
            }
        },

        // retreive from database
        get: async (did, key) => {
            if (this.ensure_did_init()) {
                await dbs.get_record(did, key, this.cache, this.session_did);
                await this.delay(1000).then(() => {
                    if (!this.cache.msg)
                        throw new Error("request timeout");
                });
    
                return this.get_result();
            }
        },
        
        // delete an entry in the database
        delete: async (did, key) => {
            if (this.ensure_did_init()) {
                await dbs.del_record(did, key, this.cache, this.session_did);
                await this.delay(1000).then(() => {
                    if (!this.cache.msg)
                        throw new Error("request timeout");
                });
    
                return this.get_result();
            }
        },
    }

}
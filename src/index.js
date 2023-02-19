// imports
import * as util from "./utility.js";
import * as kilt from "./kilt.js";
import * as dbs from "./database.js";

export class SamaritanSDK {
    connected = false;
    dbAddress = "";
    sessionDid = "";

    // for message delivery
    cache = {
        msg: ""
    }

    // connect to this address if custom address is not specified
    constructor(addr = "ws://127.0.0.1:1509") {
        this.dbAddress = addr;
    }

    // initialize the library instance
    init = async() => {
        if (!this.connected) {
            console.log("initializing library...");
            if (await kilt.connect()) {
                if (await dbs.init(this.dbAddress)) {
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
            throw("You need to initialize the SDK to continue");
        return true; 
    }

    isAuthSecure = (did, key) => {
        // check that the owner of the session is only saving/retreiving data about himself
        if (key.startsWith('$')) {
            if (this.sessionDid != "did:sam:app:FSIatHGrQ26XWGaH5CGogQkwgSEg7EvXYdGUMFTl9010j6D9" /* terminal did */)
                throw new Error ("Access to personal data: denied");
        }
        return true
    }

    // ensure app is authenticated and initialized
    ensureDidInit = () => {
        if (!this.sessionDid) { 
            if (this.sessionDid.indexOf("app") != -1  )
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
        createNew: async (name) => {
            if (!this.ensureConnection() && !name) 
                throw(`To create a Samaritan, you must specify a name.`);

            return (async function () {
                // create a light DID from KILT
                let ldid = await kilt.createKiltLightDID();
                ldid["name"] = name;

                // construct the user data root
                let root = {
                    didDoc: ldid,
                    hash_table: {}
                };

                let result = await dbs.newSamaritan(JSON.stringify(root));

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

        // describe a samaritan by returning its DID document
        describe: async(did) => {
            return (async function () {
                let result = await dbs.describeDid(did);
                console.log(JSON.parse(result).didDoc);
                return typeof result != String ? JSON.parse(result).didDoc : "";
            })();
        },

        // authenticate app or samaritan
        auth: async(keys) => {
            let result = await dbs.authDid(keys);
            // remember did, if its an app
            result.did.indexOf("app") != -1 ? this.sessionDid = result.did : "";
            return {
                exists: result.exists,
                did: result.did
            }
        },

        // revoke the access of an app
        revoke: async(did) => {
            if (!this.sessionDid || this.sessionDid.indexOf("app") != -1 ) 
                throw("You need to authenticate your samaritan before making any request");

            let result = await dbs.revoke(did, this.sessionDid);
            return result;
        }
    }

    // database entry
    db = {
        // insert into database
        insert: async (did, key, value) => {
            // console.log(`${key} <--> ${value}`);
            // console.log(`${this.sessionDid} <--> ${did}`);
            if (this.ensureDidInit() && this.isAuthSecure(did, key)) {
                let result = await dbs.insertRecord(did, key, value, this.sessionDid);
                return result;
            }
        },

        // retreive from database
        get: async (did, key) => {
            if (this.ensureDidInit() && this.isAuthSecure(did, key)) {
                let result = await dbs.getRecord(did, key, this.sessionDid);
                return result;
            }
        },
        
        // delete an entry in the database
        delete: async (did, key) => {
            if (this.ensureDidInit() && this.isAuthSecure(did, key)) {
                let result = await dbs.delRecord(did, key, this.sessionDid);
                return result;
            }
        },
    }

}
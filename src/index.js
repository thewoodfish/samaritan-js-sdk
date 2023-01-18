// imports
import * as util from "./utility.js";
import * as kilt from "./kilt.js";
import * as dbs from "./database.js";

export class SamaritanSDK {
    connected = false;
    db_address = "";

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

    // request new API KEY for app
    new_api_key = async () => {
        await dbs.new_api_key(this.parcel);
    }

    // ensure there is a connection to the server
    ensure_connection = () => {
        if (!this.connected) 
            throw("You need to initialize the SDK to continue");

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
                hash_table: []
            };

            await dbs.new_samaritan(JSON.stringify(root), this.cache);
            await this.delay(1000).then(() => {
                if (!this.cache.msg)
                    throw new Error("request timeout");
            });

            return this.cache.msg;
        },
    }

    // database entry
    db = {
        insert: function() {

        } 
    }

}
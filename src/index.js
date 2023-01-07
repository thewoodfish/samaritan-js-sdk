// imports
import * as util from "./utility.js";
import * as kilt from "./kilt.js";
import * as dbs from "./database.js";

export class SamaritanSDK {
    connected = false;
    db_address = "";

    // connect to this address if custom address is not specified
    constructor(addr = "ws://127.0.0.1:1509/ws") {
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

    did = {
        self: this,
        create_new: async(name, self = this.self) => {
            if (!name) 
                throw(`To create a Samaritan, you must specify a name for it.`);

            // create a light DID from KILT
            let ldid = await kilt.createKiltLightDID();
            ldid["name"] = name;

            return await dbs.new_samaritan(JSON.stringify(ldid));
        }
    }

    // database entry
    db = {
        insert: function() {

        }
    }

}
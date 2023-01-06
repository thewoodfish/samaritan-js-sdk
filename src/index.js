// imports
import util from "./utility.js";
import kilt from "./kilt.js";
import dbs from "./database.js";

class SamaritanSDK {
    connected = false;

    constructor(addr = "1509") {
        this.db_address = addr;
    }

    // initialize the library instance
    init() {
        if (!connected) {
            console.log("initializing...");

            (async function() {
                if (await kilt.connect()) {
                    if (await dbs.init(this.db_address)) 
                        console.log("connections successfully set up.");
                }
            })();
        }
    }

    // database entry
    db = {
        insert: function() {

        }
    }

}

module.exports = SamaritanSDK;
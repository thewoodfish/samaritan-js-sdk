import { SamaritanSDK } from 'samaritan-js-sdk';

let sam = new SamaritanSDK("ws://127.0.0.1:1509");   // connect to database server
// await sam.init("API_KEY");
await sam.init("API_KEY");

async function main() {
    // let did = await sam.did.create_new("nana").did;   // create new Samaritan, returns samaritan DID and keys

    // console.log(did);

    let cc = {
        "name": "Ella Balinska",
        "age": 26,
        "career": "actress",
        "nationality": "british"
    };

    // let api_key = await sam.did.new_api_key();

    let app = await sam.did.auth("especially september lead six note seen six home point ground corporation computer");
    if (app.exists)
        await sam.db.insert(null, "celebrity_crush", cc);
    else
        console.log("Could not produce account from keyring");

    // sam.db.insert(did, "profile", data);

    // sam.db.get(did, "config", config);
    // sam.db.get(null, "config", config);


    // console.log(api_key);
    await sam.db.insert(null, "cities", ["paris", "Vienna", "London", "New York City"]);

    
    // {
    //     did: 'did:sam:app:kxy278rC5rT8H1U9YSa9N6mv1uifxq6QD5oIOKNivf1zisGA',
    //     keys: 'especially september lead six note seen six home point ground corporation computer'
    //   }
      

    // proposed senator return itself opinion construction wife article function able outside an  -> did

    // profile schema
    /*
        "profile": {
            name,
            age,
            telephomne,
            nationality,
            networth,
            race
        }
    */
}

main();
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 
app.set("views", path.resolve(__dirname, "ok"));

/* view/templating engine */
app.set("view engine", "ejs");

process.stdin.setEncoding("utf8");
const fs = require("fs");

const prompt = "stop to shutdown server";
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: "JMFC", collection:"ASFC"};

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://kapurakshay:Akshay02@cluster0.hlpn3mx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//const portNumber = process.argv[2];

app.listen(4000, () => {
    console.log(`Server is running on http://localhost:4000`);
    console.log(prompt)
  });

  process.stdin.on("readable", function () {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
      let command = dataInput.trim();
      if (command === "stop") {
        console.log("Shutting down server");
            process.exit(0)
      } else {
        process.stdout.write("Invalid Command: "+ dataInput +"\n");
      }
      process.stdout.write(prompt);
      process.stdin.resume();
    }
  });

  app.get("/", (request, response) => {
    response.render("index");
});

app.get("/add", (request, response) => {
    response.render("add");
    const {name, rating, background} = request.query;
});

app.use(bodyParser.urlencoded({extended:false}));
app.post("/add", (request, response) => {
    
    const variables = {
      name: request.body.name,
      rating: request.body.rating,
      background: request.body.background
    }; 
    insert(request.body.name, request.body.rating, request.body.background)
    response.render("confirm", variables);
  });

  async function insert(name, rating, background) {
    try {
        await client.connect();
        let app = {name: name, LVL: rating, background: background} 
        await insertMovie(client, databaseAndCollection, app);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
async function insertMovie(client, databaseAndCollection, newMovie) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newMovie);
}

//app.use(bodyParser.urlencoded({extended:false}));
    app.get("/review", (request, response) => {
        findAll("BONGELATI98074309724")
        async function findAll(gpa) {
            try {
                await client.connect();
                let arr = await lookUpMany(client, databaseAndCollection, gpa);
                var tb = `<Table border = 1><tr><th>NAME</th><th>LEVEL</th></tr>`
                arr.forEach(x => {
                    tb += `<tr><td>${x.name}</td><td>${x.LVL}</td></tr>`          
                })
            
                tb += `</Table>`
                const variables = { 
                 arr: tb
                 }; 
                response.render("review", variables);
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }
        
        
    });


    async function lookUpMany(client, databaseAndCollection, gpa) {
        let filter = {rating : {$ne: gpa}};
        const cursor = client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);
    
        // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
        // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
        let arr = await cursor.toArray();
        
        return arr
    }

    app.get("/remove", (request, response) => {
        response.render("remove");
        const { email} = request.query;
    });

    app.use(bodyParser.urlencoded({extended:false}));
    app.post("/remove", (request, response) => {
        deleteMany()
        

        async function deleteMany() {
            try {
                await client.connect();
                
                const result = await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
                .deleteMany({});
                const variables = { 
                    count: result.deletedCount
                  }; 
                response.render("removeCount", variables);
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }
    });
    
    app.get('/global-pokedex', async function(req, res) {
        const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=151";
        const response = await fetch(apiUrl);
        const data = await response.json();
        const pokemonList = data.results;
        const pokemonDataList = [];
        num = 1;
        for (const pokemon of pokemonList) {
            const pokemonUrl = pokemon.url;
            const pokemonResponse = await fetch(pokemonUrl);
            const pokemonData = await pokemonResponse.json();
            
            pokemonDataList.push({
                name: pokemonData.name,
                id: num,
            });
            num += 1;
        }
        

        res.render('pokedex', { pokemonDataList: pokemonDataList });
      });
      
      
      
  
      
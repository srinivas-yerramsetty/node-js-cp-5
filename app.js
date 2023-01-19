const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
let initializingDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is starting at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
initializingDbandServer();

//convert snake-case to camelCase
let convertSnakeCasetoCamelCase = (eachMovie) => {
  return { movieName: eachMovie.movie_name };
};

//API to get all the movie list from the Database
app.get("/movies/", async (request, response) => {
  let selectQuery = `
    select 
    movie_name
    from
    movie;`;
  let result = await db.all(selectQuery);
  response.send(
    result.map((eachMovie) => convertSnakeCasetoCamelCase(eachMovie))
  );
});

//convert snake-case to camelCase
let convertDetailsFromSnakeCasetoCamelCase = (eachMovie) => {
  return {
    movieId: eachMovie.movie_id,
    directorId: eachMovie.director_id,
    movieName: eachMovie.movie_name,
    leadActor: eachMovie.lead_actor,
  };
};

// creating an API to get specific required details from database
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  let newQuery = `
  select 
  *
  from movie where movie_id = ${movieId};`;
  const resultantMovie = await db.get(newQuery);
  response.send(convertDetailsFromSnakeCasetoCamelCase(resultantMovie));
});

// creating an API to add new movie details into the Database
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  let insertQuery = `
    insert 
    into 
    movie 
    (director_id, movie_name, lead_actor)
    values 
    (${directorId}, 
    "${movieName}", 
    "${leadActor}");`;
  let dbResult = await db.run(insertQuery);
  const movieId = dbResult.lastID;
  response.send("Movie Successfully Added");
});

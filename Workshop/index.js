require("dotenv").config();

const pg = require("pg"); //import pg
const client = new pg.Client(process.env.DATABASE_URL);

const express = require("express"); //import express
const app = express(); //create an express app

app.use(express.json());
app.use(require("morgan")("dev"));

//READ/GET ROUTE - get full table
app.get("/api/flavors/", async (req, res, next) => {
  try {
    const SQL = /*sql*/ `
    SELECT * from flavors ORDER BY created_at DESC
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//READ/GET ROUTE - get single entry
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    SQL = /*sql*/ `
    SELECT * FROM flavors WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//POST ROUTE - gives created flavor

app.post("/api/flavors", async (req, res, next) => {
  try {
    SQL = /*sql*/ `
        INSERT INTO flavors(name, is_favorite)
        VALUES($1, $2)
        RETURNING *
        `;

    const response = await client.query(
      SQL,
      [req.body.name, req.body.is_favorite] || false
    );
    res.status(201).send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE ROUTE - delete single entry

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    SQL = /*sql*/ `
    DELETE FROM flavors
    WHERE id = $1
    `;

    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

//PUT ROUTE - edit single entry

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    SQL = /*sql*/ `
    UPDATE flavors
    SET name = $1, is_favorite = $2
    WHERE id = $3
    RETURNING *
    `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//INIT FUNCTION TO CREATE

const init = async () => {
  await client.connect();

  //CREATE TABLE
  let SQL = /*sql*/ `
DROP TABLE IF EXISTS flavors;
CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
)
`;
  await client.query(SQL);
  console.log("tables created");

  //FILL IN TABLE
  SQL = /*sql*/ `
  INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Rocky Road', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Mint Chocolate Chip', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Chocolate Chip Cookie Dough', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Pistachio', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Mango', true);
  INSERT INTO flavors(name, is_favorite) VALUES('Butter Pecan', false);
  INSERT INTO flavors(name, is_favorite) VALUES('Coffee', false);
  `;

  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

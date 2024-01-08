import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Initialize Express
const app = express();
const port = 3000;
app.set('view engine', 'ejs');


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book",
    password: "Khushi@202",
    port: 5432,
})

// Connect to the database
db.connect();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let books = [];

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY id ASC");
        books = result.rows;
        res.render("index.ejs", {
            bookItems: books,
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/add", async (req, res) => {
    const { newTitle, newIsbn, newDescription, newRating } = req.body;

    if (!newTitle) {
        return res.status(400).send("Title is required.");
    }

    const parsedRating = parseFloat(newRating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return res.status(400).send("Rating must be a number between 0 and 5.");
    }

    try {
        await db.query("INSERT INTO books(title,isbn,description,rating) VALUES ($1,$2,$3,$4)", [newTitle, newIsbn, newDescription, newRating]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});


app.get("/edit", async (req, res) => {
    const isbnToEdit = req.query.isbn;

    try {
        const result = await db.query("SELECT * FROM books WHERE isbn = $1", [isbnToEdit]);
        const bookToEdit = result.rows[0];
        res.render("edit.ejs", { bookToEdit });

    } catch (err) {
        console.error(err);
    }
});


app.post("/update", async (req, res) => {
    const { updatedTitle, updatedIsbn, updatedDescription, updatedRating } = req.body;

    // Validate input data
    if (!updatedTitle) {
        return res.status(400).send("Title is required.");
    }
    
    const parsedRating = parseFloat(updatedRating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return res.status(400).send("Rating must be a number between 0 and 5.");
    }

    try {
        await db.query("UPDATE books SET title = $1, description = $2, rating = $3 WHERE isbn = $4",
            [updatedTitle, updatedDescription, updatedRating, updatedIsbn]);

        res.redirect("/");

    } catch (err) {
        console.error(err);
    }
});


app.post("/delete", async (req, res) => {
    const isbnToDelete = req.body.isbn;

    try {
        await db.query("DELETE FROM books WHERE isbn = $1", [isbnToDelete]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

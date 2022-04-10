require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// import routes
const authRoute = require("./routes/auth");

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/api", (req, res) => {
  res.send("MERN_TODO_LIST");
});


app.use("/api/auth", authRoute);

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
}).catch((error) => {
    console.log(error);
})
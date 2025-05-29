
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/roomBooking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error", err));


const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authroutes");

app.use("/", authRoutes);
app.use("/", bookingRoutes);


app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

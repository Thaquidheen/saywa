require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const uploadFolder = "./public";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

app.use(express.static("public"));
const morganConfiguration = require("./middlewares/morgan");
app.use(morganConfiguration());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(cors());
app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "maxcdn.bootstrapcdn.com"], // example
      },
    },
  })
);

const webhookRouter = require("./routes/Payments");
app.use(
  "/webhook",
  // Use raw body parser only for this route:
  bodyParser.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  const apiKey = process.env.APP_API_KEY;
  const apiKeyRequest = req.header("x-api-key");

  // if (apiKey !== apiKeyRequest)
  //   return res.status(401).send({ ok: false, error: "Access Denied" });

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});




const authRoutes = require("./routes/Login");
const login = require("./routes/Login");
const users = require("./routes/Users");

const vehicles = require("./routes/Vehicles");

const trips = require("./routes/Trips");
const customers = require("./routes/Customers");
// const payments = require("./routes/Payments");
const notifications = require("./routes/Notifications");
const uploadRouter = require("./routes/Upload");
const referal = require("./routes/NewReferal");
const test = require("./routes/test");
const PACKAGES = require("./routes/Packages");
const TAX = require("./routes/Tax");




app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/api", login);
app.use("/api/users", users);
app.use("/api/vehicles", vehicles);
app.use("/api/trip", trips);
app.use("/api/customers", customers);

// app.use("/api/payments", payments);
app.use("/api/notifications", notifications);
app.use("/api/upload", uploadRouter);
app.use("/api/referal", referal);
app.use("/test", test);
app.use("/api/packages", PACKAGES);
app.use("/api/tax", TAX);
app.use('/vehicle_images', express.static(path.join(__dirname, 'vehicle_images')));

app.listen(port, () => {
  console.log(`Listen to port ${port}...`);
});

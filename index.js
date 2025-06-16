const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./src/route/index");
const scheduleNotification = require("./src/scheduler");
require("dotenv").config();
// const { onRequest } = require("firebase-functions/v2/https");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://staging.d2pazsmlqe3eq3.amplifyapp.com",
  "https://www.storyofpet.com",
  "https://storyofpet.com/",
  "https://pets-story-frontend.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "RefreshToken"],
  exposedHeaders: ["Content-Length", "Content-Type", "RefreshToken", "Token"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// app.use(bodyParser.json());
app.use(express.static("public"));
// app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use("/assets", express.static(`${__dirname}/uploads`));
app.use("/images", express.static(`${__dirname}/images`));
app.use("/public", express.static(`${__dirname}/../public`));
app.use("/static", express.static(`${__dirname}/../static`));
app.use("/uploads", express.static("uploads"));

// Use "/api" prefix for all routes
scheduleNotification();

app.use("/v1", routes);
// exports.api = onRequest(app);
// const options = {
//   cert: fs.readFileSync('/path/to/certificate.crt'),
//   key: fs.readFileSync('/path/to/private.key')
// };
// https.createServer(options, app).listen(443, () => {
//   console.log('Server running on https://13.251.123.28');
// });
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 8000;
  app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
  });
}

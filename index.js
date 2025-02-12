const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define Routes
app.get("/", (req, res) => {
  res.send("All good, server is running");
});
const multer  = require('multer');

//start url
app.get("/start", (req, res) => {
    res.send("start url called");
    console.log('start url')
});

//start url
app.get("/end", (req, res) => {
    res.send("start url called");
    console.log('end url')
});
// Configure Multer to store the file in memory as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.post("/upload", upload.any(), async (req, res) => {
  console.log("upload URL called");

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Pick only the first file
    const file = req.files[0];

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);

    // Set headers (using X-COCOROToken instead of Authorization)
    const headers = {
      ...formData.getHeaders(),
      "X-COCOROToken": "d0dc631549f7434d90b1ed34c1393b4d",
    };

    console.log("Uploading file to: api url");
    console.log("Headers being sent:", headers);
    console.log("File being sent:", file.originalname)
    // Define the API endpoint
    const uploadUrl =
      "https://m7.networkprint.jp/rest/v1/uploadFile?available_period=7d&max_download_count=10&service_kind=cocoro&mail_address=cocorodev.user2@gmail.com&tenant_id=K0KNM6MU8E";

    // Send request to external API (only once)
    const response = await axios.post(uploadUrl, formData, { headers });

    // Respond with the external API's response
    res.status(response.status).json(response.data);
    console.log("File successfully forwarded to external API");
    console.log("Upload Response:", response.data);

  } catch (error) {
    console.error("Error forwarding file:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload file to external API" });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.all("/callback", upload.any(), (req, res) => {
  console.log("\n===== Incoming API Response =====");
  console.log("Headers:", req.headers);
  console.log("Query Params:", req.query);

  if (req.files && req.files.length > 0) {
    console.log("Received File(s):", req.files.map(f => f.originalname));
  } else if (req.is("application/json")) {
    console.log("Received JSON:", req.body);
  } else if (req.is("text/*")) {
    console.log("Received Text:", req.body);
  } else {
    console.log("Received Raw Data:", req.body);
    fs.writeFileSync("unknown_response.bin", req.body); // Save raw response
  }

  res.status(200).send("Received!");
});

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

// Use upload.any() to accept files with any field name
app.post('/upload', upload.any(), (req, res) => {
    console.log('manasa san your file upload url called')
    // Check if any file has been uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    // Define the folder where the files will be stored
    const uploadFolder = path.join(__dirname, 'uploads');
  
    // Ensure the uploads folder exists; if not, create it
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
  
    // Iterate over the files and write each file to disk
    req.files.forEach(file => {
      const filePath = path.join(uploadFolder, file.originalname);
      fs.writeFile(filePath, file.buffer, err => {
        if (err) {
          console.error(`Error saving file ${file.originalname}:`, err);
          return res.status(500).json({ error: 'Failed to save file(s)' });
        }
      });
    });
  
    res.json({ message: 'Files uploaded successfully' });
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

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

const filePath = path.join(__dirname, 'doc_tst.pdf');
const controllerUrl = "http://localhost:8080/scan-transfer/fileupload/start"; 

app.get('/mfpscan/ExecuteJob/v1', async (req, res) => {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'File not found.' });
    }

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
            filename: 'doc_tst.pdf',
            contentType: 'application/pdf',
        });

        axios.post(controllerUrl, form, {
            headers: {
                ...form.getHeaders(),
            },
        })
        .then(() => {
            console.log('File sent successfully');
        })
        .catch((error) => {
            console.error('Error sending file:', error);
        });

        // Respond immediately without waiting for axios to complete
        res.status(200).json({ message: 'File sent to controller without waiting for response.' });
    } catch (error) {
        console.error('Error processing the file:', error);
        res.status(500).json({ message: 'Failed to send file to controller.', error: error.message });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

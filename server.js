const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "complaints.json");

app.use(express.json());
app.use(express.static(__dirname));


// Read complaints from JSON file
function readComplaints() {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}


// Save complaints to JSON file
function saveComplaints(complaints) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(complaints, null, 2)
    );
}


// Home page
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});


// GET - Retrieve all complaints
app.get("/api/complaints", function (req, res) {
    const complaints = readComplaints();

    res.json(complaints);
});


// GET - Retrieve one specific complaint
app.get("/api/complaints/:id", function (req, res) {
    const complaints = readComplaints();

    const id = Number(req.params.id);

    const complaint = complaints.find(function (item) {
        return item.id === id;
    });

    if (!complaint) {
        return res.status(404).json({
            message: "Complaint not found"
        });
    }

    res.json(complaint);
});


// POST - Create complaint
app.post("/api/complaints", function (req, res) {

    const complaints = readComplaints();

    const complaint = {
        id: Date.now(),

        residentName:
            req.body.residentName,

        residenceType:
            req.body.residenceType,

        residenceName:
            req.body.residenceName,

        roomNumber:
            req.body.roomNumber,

        contact:
            req.body.contact,

        category:
            req.body.category,

        description:
            req.body.description,

        complaintDate:
            req.body.complaintDate,

        priority:
            req.body.priority,

        status:
            "Pending"
    };


    complaints.push(complaint);

    saveComplaints(complaints);

    res.status(201).json(complaint);
});


// PUT - Update complaint
app.put("/api/complaints/:id", function (req, res) {

    const complaints = readComplaints();

    const id = Number(req.params.id);

    const complaint = complaints.find(function (item) {
        return item.id === id;
    });


    if (!complaint) {
        return res.status(404).json({
            message: "Complaint not found"
        });
    }


    if (req.body.status !== undefined) {
        complaint.status = req.body.status;
    }


    if (req.body.description !== undefined) {
        complaint.description = req.body.description;
    }


    if (req.body.priority !== undefined) {
        complaint.priority = req.body.priority;
    }


    if (req.body.category !== undefined) {
        complaint.category = req.body.category;
    }


    saveComplaints(complaints);

    res.json(complaint);
});


// DELETE - Delete complaint
app.delete("/api/complaints/:id", function (req, res) {

    const complaints = readComplaints();

    const id = Number(req.params.id);

    const newComplaints = complaints.filter(function (item) {
        return item.id !== id;
    });


    if (newComplaints.length === complaints.length) {

        return res.status(404).json({
            message: "Complaint not found"
        });

    }


    saveComplaints(newComplaints);


    res.json({
        message: "Complaint deleted successfully"
    });
});


// Start server
app.listen(PORT, function () {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
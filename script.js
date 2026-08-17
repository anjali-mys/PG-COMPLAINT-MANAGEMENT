const complaintForm = document.getElementById("complaintForm");
const complaintList = document.getElementById("complaintList");
const managementList = document.getElementById("managementList");
const searchInput = document.getElementById("searchInput");

let complaints = [];


// Load complaints
async function loadComplaints() {
    try {
        const response = await fetch("/api/complaints");

        if (!response.ok) {
            throw new Error("Could not load complaints");
        }

        complaints = await response.json();

        displayResidentComplaints(complaints);
        displayManagementComplaints(complaints);

    } catch (error) {
        console.error(error);
        complaintList.innerHTML = "<p>Could not load complaints.</p>";
        managementList.innerHTML = "<p>Could not load complaints.</p>";
    }
}


// Submit complaint
complaintForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const complaint = {
        residentName: document.getElementById("residentName").value,
        residenceType: document.getElementById("residenceType").value,
        residenceName: document.getElementById("residenceName").value,
        roomNumber: document.getElementById("roomNumber").value,
        contact: document.getElementById("contact").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        complaintDate: document.getElementById("complaintDate").value,
        priority: document.getElementById("priority").value
    };

    try {
        const response = await fetch("/api/complaints", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(complaint)
        });

        if (!response.ok) {
            throw new Error("Could not submit complaint");
        }

        const newComplaint = await response.json();

        complaints.push(newComplaint);

        displayResidentComplaints(complaints);
        displayManagementComplaints(complaints);

        complaintForm.reset();

        alert("Complaint submitted successfully.");

    } catch (error) {
        console.error(error);
        alert("Could not submit complaint.");
    }
});


// View individual complaint details
async function viewDetails(id) {
    try {
        const response = await fetch(`/api/complaints/${id}`);

        if (!response.ok) {
            throw new Error("Complaint not found");
        }

        const complaint = await response.json();

        alert(
            "COMPLAINT DETAILS\n\n" +
            "Resident: " + complaint.residentName +
            "\nResidence: " + complaint.residenceType +
            " - " + complaint.residenceName +
            "\nRoom / Flat: " + complaint.roomNumber +
            "\nContact: " + complaint.contact +
            "\nCategory: " + complaint.category +
            "\nDescription: " + complaint.description +
            "\nDate: " + (complaint.complaintDate || "Not provided") +
            "\nPriority: " + complaint.priority +
            "\nStatus: " + complaint.status
        );

    } catch (error) {
        console.error(error);
        alert("Could not load complaint details.");
    }
}


// Edit complaint
async function editComplaint(id) {

    const complaint = complaints.find(function (item) {
        return item.id === id;
    });

    if (!complaint) {
        alert("Complaint not found.");
        return;
    }

    const newCategory = prompt(
        "Enter complaint category:",
        complaint.category
    );

    if (newCategory === null || newCategory.trim() === "") {
        return;
    }

    const newDescription = prompt(
        "Enter complaint description:",
        complaint.description
    );

    if (newDescription === null || newDescription.trim() === "") {
        return;
    }

    const newPriority = prompt(
        "Enter priority (Low, Medium, High):",
        complaint.priority
    );

    if (newPriority === null || newPriority.trim() === "") {
        return;
    }

    try {
        const response = await fetch(
            `/api/complaints/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category: newCategory,
                    description: newDescription,
                    priority: newPriority
                })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update complaint");
        }

        const updatedComplaint = await response.json();

        complaints = complaints.map(function (item) {
            if (item.id === updatedComplaint.id) {
                return updatedComplaint;
            }

            return item;
        });

        displayResidentComplaints(complaints);
        displayManagementComplaints(complaints);

        alert("Complaint updated successfully.");

    } catch (error) {
        console.error(error);
        alert("Could not update complaint.");
    }
}


// Resident complaint list - SHORT SUMMARY
function displayResidentComplaints(complaintsToDisplay) {

    complaintList.innerHTML = "";

    if (complaintsToDisplay.length === 0) {
        complaintList.innerHTML = "<p>No complaints found.</p>";
        return;
    }

    complaintsToDisplay.forEach(function (complaint) {

        complaintList.innerHTML += `
            <div class="complaint-card">

                <h3>${complaint.category} Complaint</h3>

                <p>
                    <strong>Resident:</strong>
                    ${complaint.residentName}
                </p>

                <p>
                    <strong>Room / Flat:</strong>
                    ${complaint.roomNumber}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status}
                </p>

                <button onclick="viewDetails(${complaint.id})">
                    View Details
                </button>

                <button onclick="editComplaint(${complaint.id})">
                    Edit Complaint
                </button>

            </div>
        `;
    });
}


// Management complaint list
function displayManagementComplaints(complaintsToDisplay) {

    managementList.innerHTML = "";

    if (complaintsToDisplay.length === 0) {
        managementList.innerHTML = "<p>No complaints available.</p>";
        return;
    }

    complaintsToDisplay.forEach(function (complaint) {

        managementList.innerHTML += `
            <div class="complaint-card">

                <h3>${complaint.category} Complaint</h3>

                <p>
                    <strong>Resident:</strong>
                    ${complaint.residentName}
                </p>

                <p>
                    <strong>Room / Flat:</strong>
                    ${complaint.roomNumber}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${complaint.status}
                </p>

                <button onclick="viewDetails(${complaint.id})">
                    View Details
                </button>

                <label>
                    <strong>Update Status:</strong>
                </label>

                <select
                    onchange="changeStatus(${complaint.id}, this.value)"
                >
                    <option
                        value="Pending"
                        ${complaint.status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="In Progress"
                        ${complaint.status === "In Progress" ? "selected" : ""}
                    >
                        In Progress
                    </option>

                    <option
                        value="Resolved"
                        ${complaint.status === "Resolved" ? "selected" : ""}
                    >
                        Resolved
                    </option>
                </select>

                <button onclick="deleteComplaint(${complaint.id})">
                    Delete Complaint
                </button>

            </div>
        `;
    });
}


// Update status
async function changeStatus(id, newStatus) {

    try {
        const response = await fetch(
            `/api/complaints/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (!response.ok) {
            throw new Error("Could not update status");
        }

        const updatedComplaint = await response.json();

        complaints = complaints.map(function (complaint) {

            if (complaint.id === updatedComplaint.id) {
                return updatedComplaint;
            }

            return complaint;
        });

        displayResidentComplaints(complaints);
        displayManagementComplaints(complaints);

    } catch (error) {
        console.error(error);
        alert("Could not update complaint status.");
    }
}


// Delete complaint
async function deleteComplaint(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this complaint?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `/api/complaints/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Could not delete complaint");
        }

        complaints = complaints.filter(function (complaint) {
            return complaint.id !== id;
        });

        displayResidentComplaints(complaints);
        displayManagementComplaints(complaints);

        alert("Complaint deleted successfully.");

    } catch (error) {
        console.error(error);
        alert("Could not delete complaint.");
    }
}


// Search complaints
searchInput.addEventListener("input", function () {

    const searchText =
        searchInput.value.toLowerCase();

    const filteredComplaints =
        complaints.filter(function (complaint) {

            return (
                complaint.category.toLowerCase().includes(searchText) ||
                complaint.description.toLowerCase().includes(searchText) ||
                complaint.residentName.toLowerCase().includes(searchText) ||
                complaint.residenceName.toLowerCase().includes(searchText)
            );
        });

    displayResidentComplaints(filteredComplaints);
});


// Start
loadComplaints();
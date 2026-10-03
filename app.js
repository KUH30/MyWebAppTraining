// Holds all records loaded from the CSV file
let records = [];

// Get the page elements we need to work with
const searchBox = document.getElementById("searchBox");
const departmentFilter = document.getElementById("departmentFilter");
const statusFilter = document.getElementById("statusFilter");
const tableBody = document.getElementById("trainingTable");
const message = document.getElementById("message");

// Turn the CSV text into a list of objects (simple parser: no commas inside values)
function parseCsv(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (values[index] || "").trim();
    });
    return record;
  });
}

// Show the given records in the table
function showRecords(list) {
  tableBody.innerHTML = "";

  list.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.Employee}</td>
      <td>${record.Department}</td>
      <td>${record.Course}</td>
      <td>${record.Status}</td>
      <td>${record.CompletionDate}</td>
    `;
    tableBody.appendChild(row);
  });

  message.textContent = list.length === 0 ? "No matching records found." : "";
}

// Apply the search box and both filters, then redraw the table
function applyFilters() {
  const searchText = searchBox.value.toLowerCase();
  const department = departmentFilter.value;
  const status = statusFilter.value;

  const filtered = records.filter(record => {
    const matchesSearch = record.Employee.toLowerCase().includes(searchText);
    const matchesDepartment = department === "" || record.Department === department;
    const matchesStatus = status === "" || record.Status === status;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  showRecords(filtered);
}

// Load the CSV file when the page opens
fetch("data/training.csv")
  .then(response => response.text())
  .then(text => {
    records = parseCsv(text);
    showRecords(records);
  })
  .catch(() => {
    message.textContent = "Could not load data/training.csv. Open the page through a local web server.";
  });

// Re-filter whenever the user types or changes a dropdown
searchBox.addEventListener("input", applyFilters);
departmentFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

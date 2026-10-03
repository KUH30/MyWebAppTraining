// All resources loaded from the CSV file
let resources = [];

// Get the page elements we need to work with
const searchBox = document.getElementById("searchBox");
const roleFilter = document.getElementById("roleFilter");
const topicFilter = document.getElementById("topicFilter");
const typeFilter = document.getElementById("typeFilter");
const levelFilter = document.getElementById("levelFilter");
const clearButton = document.getElementById("clearButton");
const cardContainer = document.getElementById("cardContainer");
const message = document.getElementById("message");

// Turn the CSV text into a list of objects.
// Simple parser: values must not contain commas (Keywords use semicolons).
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(header => header.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const item = {};
    headers.forEach((header, index) => {
      item[header] = (values[index] || "").trim();
    });
    return item;
  });
}

// Create one HTML element with some text (textContent keeps the CSV data safe)
function createElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

// Add a "Label: value" pair to a card's detail list
function addDetail(list, label, value) {
  list.appendChild(createElement("dt", label));
  list.appendChild(createElement("dd", value));
}

// Build one card for a resource
function createCard(resource) {
  const card = document.createElement("article");
  card.className = "card";

  card.appendChild(createElement("h3", resource.Title));

  const details = document.createElement("dl");
  addDetail(details, "Topic", resource.Topic);
  addDetail(details, "Audience", resource.Audience);
  addDetail(details, "Type", resource.Type);
  addDetail(details, "Level", resource.Level);
  card.appendChild(details);

  const link = createElement("a", "Open Training", "open-button");
  link.href = resource.TrainingURL;
  // Tells screen reader users which training the button opens
  link.setAttribute("aria-label", "Open Training: " + resource.Title);
  card.appendChild(link);

  return card;
}

// Show the given resources as cards
function showResources(list) {
  cardContainer.innerHTML = "";
  list.forEach(resource => cardContainer.appendChild(createCard(resource)));

  if (list.length === 0) {
    message.textContent = "No matching resources found. Try a different search or click Clear Filters.";
  } else {
    message.textContent = "Showing " + list.length + " of " + resources.length + " resources.";
  }
}

// Apply the search text and all four dropdowns, then redraw the cards
function applyFilters() {
  const searchText = searchBox.value.trim().toLowerCase();
  const role = roleFilter.value;
  const topic = topicFilter.value;
  const type = typeFilter.value;
  const level = levelFilter.value;

  const filtered = resources.filter(resource => {
    // Search looks in Title, Topic, Audience and Keywords
    const searchableText = (
      resource.Title + " " +
      resource.Topic + " " +
      resource.Audience + " " +
      resource.Keywords
    ).toLowerCase();

    const matchesSearch = searchableText.includes(searchText);

    // "All Users" resources are for everyone, so they show for every role
    const matchesRole =
      role === "" ||
      resource.Audience === role ||
      resource.Audience === "All Users";

    const matchesTopic = topic === "" || resource.Topic === topic;
    const matchesType = type === "" || resource.Type === type;
    const matchesLevel = level === "" || resource.Level === level;

    return matchesSearch && matchesRole && matchesTopic && matchesType && matchesLevel;
  });

  showResources(filtered);
}

// Re-filter whenever the user types or changes a dropdown
searchBox.addEventListener("input", applyFilters);
[roleFilter, topicFilter, typeFilter, levelFilter].forEach(dropdown => {
  dropdown.addEventListener("change", applyFilters);
});

// "Clear Filters" resets the search box and all dropdowns
clearButton.addEventListener("click", () => {
  searchBox.value = "";
  roleFilter.value = "";
  topicFilter.value = "";
  typeFilter.value = "";
  levelFilter.value = "";
  applyFilters();
});

// Load the CSV file when the page opens
fetch("data/documents.csv")
  .then(response => response.text())
  .then(text => {
    resources = parseCsv(text);
    applyFilters();
  })
  .catch(() => {
    message.textContent = "Could not load data/documents.csv. Open the page through a local web server.";
  });

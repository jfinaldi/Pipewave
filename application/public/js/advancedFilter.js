const filter = document.getElementById("filterButton");
const bio = document.getElementById("editBioButton");
var goButton = document.getElementById("button");

check = false;
check2 = false;
styles = ["none", "inline", "flex"];

filter.addEventListener("click", e => {
  check = !check;
  displayAdvancedFilter();
  goButton.style.display = styles[check ? 0 : 1]; //make the go button disappear when advanced filter shows up
});

bio.addEventListener("click", e => {
  console.log("I clicked the edit bio button");
  check2 = !check2;
  displayBioTextField();
});

function displayAdvancedFilter() {
  var x = document.getElementById("filterContainer");
  x.style.display = styles[x.style.display === "flex" ? 0 : 2];
}

function displayBioTextField() {
  var y = document.getElementById("bio_textfield");
  var z = document.getElementById("save_bio");
  y.style.display = styles[y.style.display === "flex" ? 0 : 2];
  z.style.display = styles[z.style.display === "flex" ? 0 : 2];
}

console.log("advancedFilter.js connected");

const filter = document.getElementById("filterButton");
var goButton = document.getElementById("button");
check = false;
styles = ["none", "inline", "flex"];

filter.addEventListener("click", e => {
  check = !check;
  displayAdvancedFilter();
  goButton.style.display = styles[check ? 0 : 1];
});

function displayAdvancedFilter() {
  var x = document.getElementById("filterContainer");
  x.style.display = styles[x.style.display === "flex" ? 0 : 2];
}

console.log("advancedFilter js connected");

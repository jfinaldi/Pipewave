const filter = document.getElementById("filterButton");
var goButton = document.getElementById("button");

filter.addEventListener("click", e => {
    console.log("clicked");
    goButton.remove(); // remove the other GO button
    console.log("go button removed.");
    displayAdvancedFilter();
})

function displayAdvancedFilter() {
    var x = document.getElementById("filterContainer");
    if (x.style.display === "flex") {
        x.style.display = "none";
    } else {
        x.style.display = "flex";
    }
}

console.log("advancedFilter js connected");
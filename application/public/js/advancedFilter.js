const filter = document.getElementById("filterButton");

filter.addEventListener("click", e => {
    console.log("clicked");
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
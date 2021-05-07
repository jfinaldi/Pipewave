//create a listener for if Edit Settings button is clicked

    //if clicked, show a bunch of edit buttons for each section of the profile
console.log("profile.js connected");

const editBio = document.getElementById("editBioButton");
const bioForm = document.getElementById("bioForm");

check = false;
styles = ["none", "inline", "flex"];

editBio.addEventListener("click", e => {
    console.log("I clicked the edit bio button");
    check = !check;
    displayBioTextField();
});

function displayBioTextField() {
    console.log("displayBioTextField");
    var y = document.getElementById("bio_textfield");
    var z = document.getElementById("save_biobutton");
    var x = document.getElementById("current_bio");
    y.style.display = styles[y.style.display === "flex" ? 0 : 2];
    z.style.display = styles[z.style.display === "flex" ? 0 : 2];
    x.style.display = styles[x.style.display === "flex" ? 0 : 2];
}
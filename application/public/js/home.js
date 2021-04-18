const searchbar = document.getElementById("search");
const button = document.getElementById("button");
const error_output = document.getElementById("error_output");

const isLetter = str => {
  return str.length > 0 && str.match(/^[a-z\d\-_\s]+$/i);
};

searchbar.addEventListener("input", e => {
  if (!isLetter(e.target.value)) {
    error_output.innerHTML = "Invalid Search Query";
    button.disabled = true;
  } else {
    error_output.innerHTML = "";
    button.disabled = false;
  }
});

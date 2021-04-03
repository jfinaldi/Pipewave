var formSelector = document.getElementById("formSelector");

styles = ["none", "inline", "flex"];


formSelector.addEventListener('change', (event) => {
    if(selectorCheck(event.target.value)){
        displayFormElements();
    }
});

function selectorCheck(selectedElement) {
    if (selectedElement === "defaultValue"){
        formElements.style.display = "none"
        return false;
    } else {
        return true;
    }
}

function displayFormElements() {
  var formElements = document.getElementById("formElements");
  var occupationLabel = document.getElementById("occupationLabel");
  var occupation = document.getElementById("occupation");
  console.log(occupation);

  formElements.style.display = "block";
  switch(formSelector.value) {
    case "Student":
        occupationLabel.innerHTML = "Major";
        occupation.placeholder = "Major";
      break;
    case "Professor":
        occupationLabel.innerHTML = "Department";
        occupation.placeholder = "Department";
      break;
    case "ERG":
        occupationLabel.innerHTML = "ERG";
        occupation.placeholder = "ERG Company";
      break;
    case "NPO":
        occupationLabel.innerHTML = "NPO";
        occupation.placeholder = "NPO Company";
      break;
    case "Recruiter":
        occupationLabel.innerHTML = "Recruiter";
        occupation.placeholder = "Recruiter Company";
      break;
    default:
        occupationLabel.innerHTML = "Occupation";
        occupation.placeholder = "Occupation";
  }
//   formElements.style.display = styles[formElements.style.display === "None" ? 0 : 2];
}

console.log("register js connected");

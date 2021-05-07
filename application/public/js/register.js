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
  var student = document.getElementById("Student");
  var student2 = document.getElementById("Student2");
  var professor = document.getElementById("Professor");
  var professor2 = document.getElementById("Professor2");
  var recruiter = document.getElementById("Recruiter");
  var recruiter2 = document.getElementById("Recruiter2");

  formElements.style.display = "block";
  switch(formSelector.value) {
    case "defaultValue":
      formElements.style.display = "none"
      break;
    case "Student":
      student.style.display = "block";
      student2.style.display = "block";
      professor.style.display = "none";
      professor2.style.display = "none";
      recruiter.style.display = "none";
      recruiter2.style.display = "none";
      break;
    case "Professor":
      student.style.display = "none";
      student2.style.display = "none";
      professor.style.display = "block";
      professor2.style.display = "block";
      recruiter.style.display = "none";
      recruiter2.style.display = "none";
      break;
    case "ERG":
      student.style.display = "none";
      student2.style.display = "none";
      professor.style.display = "none";
      professor2.style.display = "none";
      recruiter.style.display = "block";
      recruiter2.style.display = "block";
      recruiter2.placeholder = "Company";
    case "NPO":
      student.style.display = "none";
      student2.style.display = "none";
      professor.style.display = "none";
      professor2.style.display = "none";
      recruiter.style.display = "block";
      recruiter2.style.display = "block";
      recruiter2.placeholder = "Company";
    case "Recruiter":
      student.style.display = "none";
      student2.style.display = "none";
      professor.style.display = "none";
      professor2.style.display = "none";
      recruiter.style.display = "block";
      recruiter2.style.display = "block";
      recruiter2.placeholder = "Company";
      break;
    default:
      student.style.display = "none";
      student2.style.display = "none";
      professor.style.display = "none";
      professor2.style.display = "none";
      recruiter.style.display = "none";
      recruiter2.style.display = "none";
      break;
  }
//   formElements.style.display = styles[formElements.style.display === "None" ? 0 : 2];
}

console.log("register.js connected");

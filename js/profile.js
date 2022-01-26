// variables
let updateBtn = document.getElementById("profileUpdateBtn");
let question7 = document.getElementById("question7");
let warning = document.getElementById("selectChekboxWarning");

// check for atleast 1 checkbox option to be selected
question7.addEventListener("change", (e) => {
  val = document.querySelectorAll('input[type="checkbox"]:checked');
  if (val.length == 0) {
    warning.classList.remove("d-none");
    warning.classList.add("d-block");
    updateBtn.disabled = true;
  } else {
    warning.classList.add("d-none");
    warning.classList.remove("d-block");
    updateBtn.disabled = false;
  }
});

// get form data
function getResults() {
  var q1 = document.getElementById("question1").value,
    q2 = document.getElementById("question2").value,
    q3 = document.getElementById("question3").value,
    q4 = document.getElementById("question4").value,
    q5 = document.getElementById("question5").value,
    q6 = document.getElementById("question6").value,
    q7CheckBox = document.getElementsByName("q7");

  q7 = [];
  for (var i = 0; i < q7CheckBox.length; i++) {
    if (q7CheckBox[i].checked) {
      q7.push(q7CheckBox[i].value);
    }
  }

  questions = {
    question1: q1,
    question2: q2,
    question3: q3,
    question4: q4,
    question5: q5,
    question6: q6,
    "question7[]": q7,
  };

  return questions;
}

updateBtn.addEventListener("click", (e) => {
  e.preventDefault(e);
  alert("The changes will be updated after the verification by admin.");
  window.location.assign("../templates/profile.html");
});

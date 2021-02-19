const post_review = document.getElementById("post_review");
const leave_a_review = document.getElementById("leave_a_review");
const review = document.getElementById("avg");
// const star1 = document.getElementById("formstar4");
function color(x, extra = "") {
  for (let i = 0; i < parseInt(x); i++) {
    document.getElementById(`${extra}star${i + 1}`).style.color = "rgb(120, 209, 224)";
  }
}
color(review.textContent);
const formavg = document.getElementById("formavg");
document.getElementById("formstar1").addEventListener("click", () => {
  formavg.innerHTML = "1.0";
  color(1, "form");
});
document.getElementById("formstar2").addEventListener("click", () => {
  formavg.innerHTML = "2.0";
  color(2, "form");
});
document.getElementById("formstar3").addEventListener("click", () => {
  formavg.innerHTML = "3.0";
  color(3, "form");
});
document.getElementById("formstar4").addEventListener("click", () => {
  formavg.innerHTML = "4.0";
  color(4, "form");
});
document.getElementById("formstar5").addEventListener("click", () => {
  formavg.innerHTML = "5.0";
  color(5, "form");
});

console.log(review.textContent);
let comments_displayed = false;
// clean code to toggle review section :)
const display_comments = x => {
  leave_a_review.style.opacity = x;
  ~(comments_displayed = !comments_displayed) && leave_a_review.scrollIntoView({ behavior: "smooth" });
};

post_review.addEventListener("click", () => {
  display_comments(!comments_displayed ? 1 : 0);
});

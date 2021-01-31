const post_review = document.getElementById("post_review");
const leave_a_review = document.getElementById("leave_a_review");
let comments_displayed = false;
// clean code to toggle review section :)
const display_comments = x => {
  leave_a_review.style.opacity = x;
  comments_displayed = !comments_displayed;
};
post_review.addEventListener("click", () => {
  display_comments(!comments_displayed ? 1 : 0);
});

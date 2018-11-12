// reference: https://alexandroperez.github.io/mws-walkthrough/

class ReviewForm {
/**
 * Returns a li element with review data so it can be appended to 
 * the review list.
 */
static createReviewHTML(review) {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Clear form data
 */
static clearForm() {
  // clear form data
  document.getElementById('name').value = "";
  document.getElementById('rating').selectedIndex = 0;
  document.getElementById('comments').value = "";
}

/**
 * Make sure all form fields have a value and return data in
 * an object, so is ready for a POST request.
 */
static validateAndGetData() {
  const data = {};

  // get name
  let name = document.getElementById('name');
  if (name.value === '') {
    name.focus();
    return;
  }
  data.name = name.value;

  // get rating
  const ratingSelect = document.getElementById('rating');
  const rating = ratingSelect.options[ratingSelect.selectedIndex].value;
  if (rating == "--") {
    ratingSelect.focus();
    return;
  }
  data.rating = Number(rating);

  // get comments
  let comments = document.getElementById('comments');
  if (comments.value === "") {
    comments.focus();
    return;
  }
  data.comments = comments.value;

  // get restaurant_id
  let restaurantId = document.getElementById('review-form').dataset.restaurantId;
  data.restaurant_id = Number(restaurantId);

  // set createdAT
  data.createdAt = new Date().toISOString();

  return data;
}

/**
 * Handle submit. 
 */
static handleSubmit(e) {
  e.preventDefault();
  const review = ReviewForm.validateAndGetData();
  if (!review) return;

  review['id'] = Math.floor(Math.random() * 99999999);

  const url = `${DBHelper.API_URL}/reviews/`;
  const POST = {
    method: 'POST',
    body: JSON.stringify(review)
  };
  
  ((newNetworkReview => {
    // save new review on idb
    console.log("Updating idb");
    dbPromise.putReviews(newNetworkReview);
    // post new review on page
    const reviewList = document.getElementById('reviews-list');
    const review = ReviewForm.createReviewHTML(newNetworkReview);
    reviewList.appendChild(review);
    // clear form
    ReviewForm.clearForm();
  }))(review);

  if (!window.SyncManager || !navigator.serviceWorker) {
    console.log('Sync not supported.');
    return fetch(url, POST);
  } else {
    console.log('Sync supported');
    return navigator.serviceWorker.ready.then(function (reg) {
      console.log("Registering for sync.");
      return reg.sync.register('syncReviews');
    }).catch(function() {
      console.log("Registering for sync failed.")
      // system was unable to register for a sync,
      // this could be an OS-level restriction
      return fetch(url, POST);
    });
  }
}

/**
 * Returns a form element for posting new reviews.
 */
static reviewForm(restaurantId) {
  const form = document.createElement('form');
  form.id = "review-form";
  form.dataset.restaurantId = restaurantId;

  let p = document.createElement('p');
  const name = document.createElement('input');
  name.id = "name"
  name.setAttribute('type', 'text');
  name.setAttribute('aria-label', 'Name');
  name.setAttribute('placeholder', 'Enter Your Name');
  p.appendChild(name);
  form.appendChild(p);

  p = document.createElement('p');
  const selectLabel = document.createElement('label');
  selectLabel.setAttribute('for', 'rating');
  selectLabel.innerText = "Your rating: ";
  p.appendChild(selectLabel);
  const select = document.createElement('select');
  select.id = "rating";
  select.name = "rating";
  select.classList.add('rating');
  ["--", 1,2,3,4,5].forEach(number => {
    const option = document.createElement('option');
    option.value = number;
    option.innerHTML = number;
    if (number === "--") option.selected = true;
    select.appendChild(option);
  });
  p.appendChild(select);
  form.appendChild(p);

  p = document.createElement('p');
  const textarea = document.createElement('textarea');
  textarea.id = "comments";
  textarea.setAttribute('aria-label', 'comments');
  textarea.setAttribute('placeholder', 'Enter any comments here');
  textarea.setAttribute('rows', '10');
  p.appendChild(textarea);
  form.appendChild(p);

  p = document.createElement('p');
  const addButton = document.createElement('button');
  addButton.setAttribute('type', 'submit');
  addButton.setAttribute('aria-label', 'Add Review');
  addButton.classList.add('add-review');
  addButton.innerHTML = "<span>Submit</span>";
  p.appendChild(addButton);
  form.appendChild(p);

  form.onsubmit = ReviewForm.handleSubmit;

  return form;
};
};
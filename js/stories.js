"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  //check if is favorite, if is favorite, add -fill
  const favoriteIconHtmlClass = getFavoriteIconHtmlClass(story, currentUser);
  return $(`
      <li id="${story.storyId}">
        <span class="favorite-story ${favoriteIconHtmlClass}"></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/**Takes in story instance and user
 * If user is undefined, returns hidden so buttons don't show
 * if user logged in, if the story is in their favorites return filled balloon
 * else, returns unfilled balloon
 */
function getFavoriteIconHtmlClass(story, user){
  //if the user isn't logged in 
  if(user === undefined){
    return 'hidden'
  }
  if(user.checkIfFavorite(story)){
    return 'bi bi-balloon-heart-fill';
  } else {
    return 'bi bi-balloon-heart'
  }
}
//f

/**
 * Gets data from submitStoryForm
 * adds story to storyList
 * Calls putStoriesOnPage() to display new Story on screen
 */
async function submitNewStory(evt) {
  evt.preventDefault();
  //gets form data
  //author-input, title-input, url-input
  const authorInput = $('#author-input').val();
  const titleInput = $('#title-input').val();
  const urlInput = $('#url-input').val();
  //calls add story
  const newStory = {
    author: authorInput,
    title: titleInput,
    url: urlInput
  };
  const storyInstance = await storyList.addStory(currentUser, newStory);
  storyList.stories.unshift(storyInstance);
  //get story markup for our instance
  //prepend story to a
  $allStoriesList.prepend(generateStoryMarkup(storyInstance));
}
//event listener for submitStoryForm
$submitStoryForm.on('submit', submitNewStory);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoriteStoriesOnPage() {
  $allStoriesList.empty();
  const favoriteStories = currentUser.favorites;

  for (let story of favoriteStories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
}

//$allStoriesList.on('click', '.favorite-story', console.log(evt));

async function handleFavoriteUnfavorite(evt) {
  evt.preventDefault();
  //Use jquery + css selectors to select the parent li element
  //and get the id that it stores
  const $favoriteButton = $(evt.target);
  const clickedStoryId = $favoriteButton.closest('li').attr('id');
  //check if that id is in userFavorites (currentUser.favorites.contains(id))
  const story = (await Story.getStoryId(clickedStoryId));
  //herewe can use  the evt to see if its filled and then call that way


  if ($favoriteButton.hasClass('bi-balloon-heart-fill')) {
    currentUser.deleteFavorite(story);
    $favoriteButton.toggleClass('bi-balloon-heart-fill bi-balloon-heart');
  } else {
    currentUser.addFavorite(story);
    $favoriteButton.toggleClass('bi-balloon-heart-fill bi-balloon-heart');


  }
}


$allStoriesList.on('click', '.favorite-story', handleFavoriteUnfavorite);
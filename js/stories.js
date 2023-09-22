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
  return $(`
      <li id="${story.storyId}">
        <span class="favorite-story bi bi-balloon-heart"></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

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

async function handleFavoriteUnfavorite(evt){
  evt.preventDefault();
  //Use jquery + css selectors to select the parent li element
  //and get the id that it stores
  const clickedStoryId = $(evt.target).closest('li').attr('id');
  //check if that id is in userFavorites (currentUser.favorites.contains(id))
  const story = (await Story.getStoryId(clickedStoryId));

  for(let i = 0; i < currentUser.favorites.length; i++){
    if(currentUser.favorites[i].storyId === story.storyId){
      $(evt.target).toggleClass('bi-balloon-heart-fill')
      $(evt.target).toggleClass('bi-balloon-heart')

      currentUser.deleteFavorite(story);
      return;
    }
  }

  $(evt.target).toggleClass('bi-balloon-heart-fill')
  $(evt.target).toggleClass('bi-balloon-heart')

  currentUser.addFavorite(story);
}


$allStoriesList.on('click', '.favorite-story', handleFavoriteUnfavorite);
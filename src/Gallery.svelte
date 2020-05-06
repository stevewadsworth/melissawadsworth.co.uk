<script>
  import { onMount } from "svelte";

  export let url;

  let current = 0;
  let data = [];

  onMount(async function() {
      const response = await fetch(url);
      data = await response.json();
  });

  function moveRight() {
    current = current + 1;
    if (current >= data.length) {
      current = 0;
    }
  }

  function moveLeft() {
    current = current - 1;
    if (current < 0) {
      current = data.length - 1;
    }
  }

  function rightClick(e) {
    console.log(e);
    return true;
  }
</script>

<h2>Gallery</h2>
<div class="galleryContainer">
    <button class="galleryButtonText galleryButtonTextLeft" on:click="{moveLeft}"><span class="fas fa-chevron-left"></span> Previous</button>
    <button class="galleryButtonText galleryButtonTextRight" on:click="{moveRight}">Next <span class="fas fa-chevron-right"></span></button>
    <button id="leftButton" class="galleryButton galleryButtonLeft" on:click="{moveLeft}" title="previous">
    <span class="fas fa-chevron-left"></span>
    </button>
    <ul id="galleryList" class="galleryList">
      {#each data as item, i}
        <li class="galleryItem {current === i ? 'galleryItemVisible' : ''}">
          <div class="galleryItemContainer">
            <img class="galleryImage" src="images/{item.image}" alt="{item.title}, {item.year}">
            <div class="galleryDescription">
                <p>{item.title}</p>
                <p>{item.medium}</p>
                <p>{item.year}</p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
    <button id="rightButton" class="galleryButton galleryButtonRight" on:click="{moveRight}" title="next">
    <span class="fas fa-chevron-right"></span>
    </button>
</div>

<style>
.galleryContainer {
  position: relative;
}

.galleryButtonText {
  position: relative;
  display: none;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  color: gray;
  padding: 0.5rem;
}

.galleryButtonText:focus {
  outline: none;
}

.galleryButtonText:active {
  color: gainsboro;
}

.galleryButtonTextLeft {
  float: left;
}

.galleryButtonTextRight {
  float: right;
}

.galleryButton {
  position: relative;
  display: inline-block;
  width: 75px;
  height: 500px;
  background-color: rgba(0, 0, 0, 0);
  border: none;
  color: gainsboro;
  text-align: center;
  text-decoration: none;
  font-size: 48px;
  -webkit-transition-duration: 0.4s; /* Safari */
  transition-duration: 0.4s;
}

.galleryButtonLeft {
  float: left;
}

.galleryButtonRight {
  float: right;
}

.galleryButton:hover {
  color: gray;
}

.galleryButton:focus {
  outline: none;
}

.galleryButton:active {
  color: gainsboro;
}

.galleryList {
  display: inline-block;
  height:500px;
  width: 600px;
  border: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.galleryItem {
  position: absolute;
  width: inherit;
  height: inherit;
  align-items: center;
  transition: opacity 500ms;
  visibility: hidden;
  opacity: 0;
}

.galleryItemContainer {
  margin: auto;
  width: fit-content;
}

.galleryItemVisible {
  visibility: visible;
  opacity: 1;
}

.galleryDescription {
  height: fit-content;
}

.galleryDescription > p {
  font-size: 0.8rem;
  line-height: 0.5;
  margin-left: 0;
  margin-right: 0;
  text-align: right;
}

.galleryImage {
  max-height: 400px;
  object-fit: contain;
  pointer-events: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

@media screen and (max-width: 750px) {
  .galleryButton {
    display: none;
  }

  .galleryButtonText {
    display: inline;
  }
}

@media screen and (max-width: 600px) {
  .galleryList {
    width: 100%;
  }

  .galleryImage {
    width: 100%;
    height: auto;
  }

  .galleryDescription {
    margin-right: 2rem;
  }
}
</style>

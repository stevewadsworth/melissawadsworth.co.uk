<script>
function moveGallery(direction) {
  let pic = document.querySelector(".galleryItemVisible");
  let next;
  if (direction > 0) {
    next = pic.nextElementSibling || pic.parentElement.firstElementChild;
  } else if (direction < 0) {
    next = pic.previousElementSibling || pic.parentElement.lastElementChild;
  }
  pic.classList.remove("galleryItemVisible");
  next.classList.add("galleryItemVisible");
}
</script>

<h2>Gallery</h2>
<div class="galleryContainer">
    <button class="galleryButtonText galleryButtonTextLeft" onclick="moveGallery(1)"><span class="fas fa-chevron-left"></span> Previous</button>
    <button class="galleryButtonText galleryButtonTextRight" onclick="moveGallery(-1)">Next <span class="fas fa-chevron-right"></span></button>
    <button id="leftButton" class="galleryButton galleryButtonLeft" onclick="moveGallery(-1)" title="previous">
    <span class="fas fa-chevron-left"></span>
    </button>
    <ul id="galleryList" class="galleryList">
    <li class="galleryItem galleryItemVisible">
        <div class="galleryItemContainer">
        <img class="galleryImage" src="images/Bunting.jpeg" alt="Bunting, Acrylic on canvas, 2019">
        <div class="galleryDescription">
            <p>Bunting</p>
            <p>Acrylic on canvas</p>
            <p>2019</p>
        </div>
        </div>
    </li>
    <li class="galleryItem">
        <div class="galleryItemContainer">
        <img class="galleryImage" src="images/Coombe-Bissett-III.jpeg" alt="Coombe Bissett Barn III, Charcoal on paper, 2019">
        <div class="galleryDescription">
            <p>Coombe Bissett Barn III</p>
            <p>Charcoal on paper</p>
            <p>2019</p>
        </div>
        </div>
    </li>
    <li class="galleryItem">
        <div class="galleryItemContainer">
        <img class="galleryImage" src="images/Portrait-of-a-Woman-II.jpeg" alt="Portrait of a Woman II, Gouache, 2019">
        <div class="galleryDescription">
            <p>Portrait of a Woman II</p>
            <p>Gouache</p>
            <p>2019</p>
        </div>
        </div>
    </li>
    <li class="galleryItem">
        <div class="galleryItemContainer">
        <img class="galleryImage" src="images/Hill-and-Vale.jpeg" alt="Hill and Vale, Charcoal on paper, 2019">
        <div class="galleryDescription">
            <p>Hill and Vale</p>
            <p>Charcoal on paper</p>
            <p>2019</p>
            </div>
        </div>
    </li>
    <li class="galleryItem">
        <div class="galleryItemContainer">
        <img class="galleryImage" src="images/Trees.jpeg" alt="Trees, Acrylic on canvas, 2019">
        <div class="galleryDescription">
            <p>Trees</p>
            <p>Acrylic on canvas</p>
            <p>2019</p>
        </div>
        </div>
    </li>
    <li class="galleryItem">
        <div class="galleryItemContainer">
            <img class="galleryImage" src="images/Portraits-of-Lizzy.jpeg" alt="Portraits of Lizzy, Pencil on paper, 2019">
            <div class="galleryDescription">
            <p>Portraits of Lizzy</p>
            <p>Pencil on paper</p>
            <p>2019</p>
            </div>
        </div>
        </li>
        <li class="galleryItem">
            <div class="galleryItemContainer">
            <img class="galleryImage" src="images/Portrait-of-a-Woman-I.jpeg" alt="Portrait of a Woman I, Pencil on paper, 2019">
            <div class="galleryDescription">
                <p>Woman</p>
                <p>Pencil on paper</p>
                <p>2019</p>
            </div>
            </div>
        </li>
        </ul>
    <button id="rightButton" class="galleryButton galleryButtonRight" onclick="moveGallery(1)" title="next">
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
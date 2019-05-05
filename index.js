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

function openMenu() {
  let topNav = document.querySelector(".topNav");
  if (topNav.className === "topNav") {
    topNav.classList.add("responsive");
  } else {
    topNav.classList.remove("responsive");
  }
}
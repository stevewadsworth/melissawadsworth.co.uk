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
  let icon = topNav.querySelector(".icon i");
  if (topNav.className === "topNav") {
    topNav.classList.add("responsive");
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    topNav.classList.remove("responsive");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
}
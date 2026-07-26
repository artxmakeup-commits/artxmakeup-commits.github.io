(function () {
  "use strict";

  document.getElementById("footer-year").textContent = new Date().getFullYear();

  initMobileNav();
  document.querySelectorAll(".gallery-group").forEach(initGalleryGroup);

  function initMobileNav() {
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("menu-toggle");
    var mobileNav = document.getElementById("mobile-nav");

    function setOpen(open) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
  }

  function initGalleryGroup(group) {
    var ZOOM_MIN = 1;
    var ZOOM_MAX = 2.5;
    var ZOOM_STEP = 0.25;
    var SWIPE_THRESHOLD = 40;

    var buttons = Array.prototype.slice.call(group.querySelectorAll(".gallery__button"));
    var items = buttons.map(function (button) {
      return { src: button.dataset.src, caption: button.dataset.caption };
    });

    if (items.length === 0) return;

    var lightbox = group.querySelector("[data-lightbox]");
    var closeBtn = lightbox.querySelector("[data-close]");
    var prevBtn = lightbox.querySelector("[data-prev]");
    var nextBtn = lightbox.querySelector("[data-next]");
    var hint = lightbox.querySelector(".lightbox__hint");
    var mobileViewer = lightbox.querySelector("[data-mobile-viewer]");
    var mobileImage = lightbox.querySelector("[data-mobile-image]");
    var desktopViewer = lightbox.querySelector("[data-desktop-viewer]");
    var desktopImage = lightbox.querySelector("[data-desktop-image]");
    var zoomWrap = lightbox.querySelector("[data-zoom-wrap]");
    var peekPrevBtn = lightbox.querySelector("[data-peek-prev]");
    var peekNextBtn = lightbox.querySelector("[data-peek-next]");
    var peekPrevImage = lightbox.querySelector("[data-peek-prev-image]");
    var peekNextImage = lightbox.querySelector("[data-peek-next-image]");
    var zoomInBtn = lightbox.querySelector("[data-zoom-in]");
    var zoomOutBtn = lightbox.querySelector("[data-zoom-out]");
    var zoomValue = lightbox.querySelector("[data-zoom-value]");

    var activeIndex = null;
    var zoom = 1;
    var touchStart = null;

    if (items.length <= 1) {
      hint.style.display = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }

    buttons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        open(index);
      });
    });

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", close);
    [mobileViewer, desktopViewer].forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });

    prevBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      goToPrevious();
    });
    nextBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      goToNext();
    });
    peekPrevBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      goToPrevious();
    });
    peekNextBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      goToNext();
    });

    zoomInBtn.addEventListener("click", function () {
      setZoom(Math.min(ZOOM_MAX, Math.round((zoom + ZOOM_STEP) * 100) / 100));
    });
    zoomOutBtn.addEventListener("click", function () {
      setZoom(Math.max(ZOOM_MIN, Math.round((zoom - ZOOM_STEP) * 100) / 100));
    });

    mobileViewer.addEventListener("touchstart", function (event) {
      var touch = event.touches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    });
    mobileViewer.addEventListener("touchend", function (event) {
      var start = touchStart;
      touchStart = null;
      if (!start) return;

      var touch = event.changedTouches[0];
      var deltaX = touch.clientX - start.x;
      var deltaY = touch.clientY - start.y;

      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) {
        return;
      }

      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (activeIndex === null) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    });

    function open(index) {
      activeIndex = index;
      zoom = 1;
      render();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    function close() {
      activeIndex = null;
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    function goToPrevious() {
      if (activeIndex === null) return;
      zoom = 1;
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      render();
    }

    function goToNext() {
      if (activeIndex === null) return;
      zoom = 1;
      activeIndex = (activeIndex + 1) % items.length;
      render();
    }

    function setZoom(value) {
      zoom = value;
      zoomWrap.style.transform = "scale(" + zoom + ")";
      zoomValue.textContent = Math.round(zoom * 100) + "%";
      zoomOutBtn.disabled = zoom <= ZOOM_MIN;
      zoomInBtn.disabled = zoom >= ZOOM_MAX;
    }

    function render() {
      if (activeIndex === null) return;

      var activeItem = items[activeIndex];
      var previousItem = items[(activeIndex - 1 + items.length) % items.length];
      var nextItem = items[(activeIndex + 1) % items.length];

      mobileImage.src = activeItem.src;
      mobileImage.alt = activeItem.caption;

      desktopImage.src = activeItem.src;
      desktopImage.alt = activeItem.caption;

      peekPrevImage.src = previousItem.src;
      peekNextImage.src = nextItem.src;

      setZoom(1);
    }
  }
})();

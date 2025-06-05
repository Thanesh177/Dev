const sections = document.querySelectorAll(".section");
const dots = document.querySelectorAll(".dot");

// 1️⃣ Build an IntersectionObserver to watch each section:
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // When a section is ≥60% visible, mark it “active”
        const index = [...sections].indexOf(entry.target);
        updateActiveSection(index);
      }
    });
  },
  { threshold: 0.6 }
);

// Start observing every section
sections.forEach((section) => observer.observe(section));

function updateActiveSection(index) {
  // Toggle “active” class on sections
  sections.forEach((sec, i) => {
    sec.classList.toggle("active", i === index);
  });

  // Toggle “active” class on dots
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

// 2️⃣ Make each dot clickable so it scrolls to the right section:
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    sections[i].scrollIntoView({
      behavior: "smooth",
      block: "start" // since scroll-snap-align: start
    });
  });
});


//image track functionality
document.addEventListener("DOMContentLoaded", function () {
  const track = document.getElementById("image-track");

  // Initialize data attributes
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = "0";
  track.dataset.percentage = "0";

  let targetPercentage = 0;
  let currentPercentage = 0;

  // When pointer (mouse or touch) presses down
  const handleOnDown = (e) => {
    track.dataset.mouseDownAt = e.clientY.toString(); // use clientY now
  };

  // When pointer is released or leaves
  const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
  };

  // When pointer moves (dragging)
  const handleOnMove = (e) => {
    if (track.dataset.mouseDownAt === "0") return;

    // Calculate vertical drag delta
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientY;
    const maxDelta = window.innerHeight / 2; // vertical half of viewport
    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained =
      parseFloat(track.dataset.prevPercentage || "0") + percentage;

    // Compute how tall the entire track is vs. viewport height
    const trackHeight = track.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScrollPercentage =
      -((trackHeight - viewportHeight) / trackHeight) * 100;

    // Constrain between 0 (top) and maxScrollPercentage (negative)
    const nextPercentage = Math.max(
      Math.min(nextPercentageUnconstrained, 0),
      maxScrollPercentage
    );

    track.dataset.percentage = nextPercentage.toString();
    targetPercentage = nextPercentage;
  };

  // Mouse events
  track.addEventListener("mousedown", handleOnDown);
  track.addEventListener("mouseup", handleOnUp);
  track.addEventListener("mouseleave", handleOnUp);
  track.addEventListener("mousemove", handleOnMove);

  // Touch events
  track.addEventListener("touchstart", (e) => handleOnDown(e.touches[0]));
  track.addEventListener("touchend", handleOnUp);
  track.addEventListener("touchmove", (e) => {
    e.preventDefault();
    handleOnMove(e.touches[0]);
  });

  // Auto‐scroll setup (scrolls downward until loop)
  let autoScrollActive = true;
  const scrollSpeed = 0.1; // adjust for faster/slower vertical auto‐scroll

  const autoScroll = () => {
    if (autoScrollActive) {
      targetPercentage -= scrollSpeed;
      // Once fully scrolled, jump back up
      if (targetPercentage <= -100) {
        targetPercentage = 0;
      }
    }
  };

  // Pause auto‐scroll on interaction
  track.addEventListener("click", () => {
    autoScrollActive = false;
  });
  track.addEventListener("mouseleave", () => {
    autoScrollActive = true;
  });

  setInterval(autoScroll, 200);

  // Animate the translateY and parallax
  const updatePosition = () => {
    // Smoothly ease toward targetPercentage
    currentPercentage += (targetPercentage - currentPercentage) * 0.1;
    track.style.transform = `translateY(${currentPercentage}%)`;

    // Parallax: shift each image’s object‐position vertically
    for (const image of track.getElementsByClassName("image")) {
      image.style.objectPosition = `center ${100 + currentPercentage}%`;
    }

    requestAnimationFrame(updatePosition);
  };

  updatePosition();
});

//image slider
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".slider-track");
  const slides = Array.from(track.children);        // all .slide elements
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const sliderWindow = document.querySelector(".slider-window");

  // Compute each slide’s width + margin (in px)
  const slideWidth = slides[0].getBoundingClientRect().width;
  const slideMargin = parseInt(
    window.getComputedStyle(slides[0]).marginRight,
    10
  );

  let currentIndex = 0;  // index of the slide that should be centered

  // ===== FUNCTION: Position track so slide[currentIndex] is centered in .slider-window =====
  function updateTrackPosition() {
    const windowWidth = sliderWindow.getBoundingClientRect().width;

    // Desired left‐offset (px) from track’s left to the targeted slide’s left:
    const desiredSlideLeft = (slideWidth + slideMargin) * currentIndex;

    // We want that slide’s center to align with window’s center:
    // windowCenterX = windowWidth / 2
    // slideCenterOffsetFromTrackLeft = desiredSlideLeft + slideWidth/2
    // trackShift = slideCenterOffsetFromTrackLeft - windowCenterX

    const slideCenterOffset = desiredSlideLeft + slideWidth / 2;
    const windowCenterX = windowWidth / 2;
    const trackShift = slideCenterOffset - windowCenterX;

    // Apply negative translateX so the track moves left
    track.style.transform = `translateX(${-trackShift}px)`;
  }

  // ===== FUNCTION: Toggle `active` class on the centered slide =====
  function updateActiveSlide() {
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    });
  }

  // ===== FUNCTION: Enable/Disable Prev/Next Buttons at ends =====
  function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;
  }

  // ===== INITIAL SETUP =====
  // Center the first slide on load
  updateTrackPosition();
  updateActiveSlide();
  updateButtons();

  // ===== EVENT: Click “Next” =====
  nextBtn.addEventListener("click", () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateTrackPosition();
      updateActiveSlide();
      updateButtons();
    }
  });

  // ===== EVENT: Click “Prev” =====
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateTrackPosition();
      updateActiveSlide();
      updateButtons();
    }
  });

  // ===== OPTIONAL: Re-center on window resize =====
  window.addEventListener("resize", () => {
    updateTrackPosition();
  });
});




let next = document.querySelector('.next')
let prev = document.querySelector('.prev')

next.addEventListener('click', function(){
    let items = document.querySelectorAll('.items')
    document.querySelector('.slides').appendChild(items[0])
})

prev.addEventListener('click', function(){
    let items = document.querySelectorAll('.items')
    document.querySelector('.slides').prepend(items[items.length - 1]) // here the length of items = 6
})
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

  // Pointer presses down
  const handleOnDown = (e) => {
    track.dataset.mouseDownAt = e.clientX.toString();
  };

  // Pointer released or leaves
  const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
  };

  // Pointer moves (dragging)
  const handleOnMove = (e) => {
    if (track.dataset.mouseDownAt === "0") return;

    // Horizontal drag delta
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
    const maxDelta = window.innerWidth / 2; // half viewport width
    const percentage = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained =
      parseFloat(track.dataset.prevPercentage || "0") + percentage;

    // Compute how wide the track is vs. viewport
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxScrollPercentage =
      -((trackWidth - viewportWidth) / trackWidth) * 100;

    // Constrain between 0 (leftmost) and maxScrollPercentage (negative)
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

  // Auto-scroll setup (scrolls rightward until loop)
  let autoScrollActive = true;
  const scrollSpeed = 0.05; // adjust for faster/slower horizontal auto-scroll

  const autoScroll = () => {
    if (autoScrollActive) {
      targetPercentage -= scrollSpeed;
      if (targetPercentage <= -100) {
        targetPercentage = 0;
      }
    }
  };

  // Pause auto-scroll when interacting
  track.addEventListener("click", () => {
    autoScrollActive = false;
  });
  track.addEventListener("mouseleave", () => {
    autoScrollActive = true;
  });

  setInterval(autoScroll, 16); // ~60fps

  // Animate translateX and horizontal parallax
  const updatePosition = () => {
    // Ease toward target
    currentPercentage += (targetPercentage - currentPercentage) * 0.1;
    track.style.transform = `translateX(${currentPercentage}%)`;

    // Parallax each image’s object-position horizontally
    for (const img of track.getElementsByClassName("image")) {
      img.style.objectPosition = `${100 + currentPercentage}% center`;
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

//scroll navigation button

// put this in your script (after the DOM has loaded)
const container = document.querySelector('.slider-container');
const track = document.getElementById('track');
const slides = track.children;
const slideCount = slides.length / 2; // only original slides count
let currentIndex = 0;

// assume all slides are same width:
const slideWidth = slides[0].getBoundingClientRect().width;

document.getElementById('nextBtn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % slideCount;
  container.scrollTo({
    left: currentIndex * slideWidth,
    behavior: 'smooth'
  });
});

document.getElementById('prevBtn').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + slideCount) % slideCount;
  container.scrollTo({
    left: currentIndex * slideWidth,
    behavior: 'smooth'
  });
});




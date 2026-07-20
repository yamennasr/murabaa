const revealElements = document.querySelectorAll('[data-reveal]');
const cube = document.querySelector('.cube');
const hero = document.querySelector('.hero');
const sections = Array.from(document.querySelectorAll('.hero, .offer-section, .stats-section, .advantages-section, .process-section, .contact-section'));

const motionPoints = [
  { progress: 0.0, x: 0.3, y: -0.12, rotateY: 24, rotateX: -18, size: 1.2 },
  { progress: 0.001, x: -0.4, y: -0.01, rotateY: 20, rotateX: 10, size: 0.9 },
  { progress: 0.01, x: -0.8, y: -0.01, rotateY: 100, rotateX: 20, size: 0.9 },
  { progress: 0.02, x: -0.8, y: -0.03, rotateY: 130, rotateX: -20, size: 0.9 },
  { progress: 0.35, x: -0.8, y: -0.04, rotateY: 150, rotateX: 8, size: 0.9 },
  { progress: 0.65, x: 0.73, y: -0.001, rotateY: 250, rotateX: 4, size: 0.8 },
  { progress: 0.78, x: 0.74, y: 0.2, rotateY: 240, rotateX: 2, size: 0.76 },
  { progress: 1, x: 0.75, y: 0.5, rotateY: 230, rotateX: -4, size: 0.76 },
  { progress: 1.5, x: 0.75, y: 0.7, rotateY: 394, rotateX: 4, size: 0.76 },
  { progress: 1.9, x: 0.8, y: 0.75, rotateY: 400, rotateX: 2, size: 0.76 },
  { progress: 2.5, x: -0.5, y: 0.9, rotateY: 484, rotateX: -2, size: 0.74 },
  { progress: 2.7, x: -0.5, y: 0.85, rotateY: 425, rotateX: -4, size: 0.72 },
  { progress: 2.8, x: 0.65, y: 0.9, rotateY: 300, rotateX: -6, size: 0.72 },
  { progress: 2.83, x: 0.74, y: 0.9, rotateY: 290, rotateX: -4, size: 0.72 },
  { progress: 2.84, x: 0.76, y: 0.9, rotateY: 270, rotateX: -2, size: 0.7 },
  { progress: 2.85, x: 0.3, y: 0.7, rotateY: -300, rotateX: 6, size: 0.7 }
];

function revealOnScroll() {
  const trigger = window.innerHeight * 0.9;

  revealElements.forEach((element) => {
    const top = element.getBoundingClientRect().top;
    if (top < trigger) {
      element.classList.add('is-visible');
    }
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function smoothStep(value) {
  return value * value * (3 - 2 * value);
}

function updateCubeMotion() {
  if (!cube) {
    return;
  }

  const viewportHeight = window.innerHeight;
  const documentHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
  const scrollY = window.scrollY;
  const scrollProgress = clamp(scrollY / documentHeight, 0, 1);
  const easedProgress = smoothStep(easeInOut(scrollProgress));
  const maxProgress = Math.max(...motionPoints.map((point) => point.progress), 1);
  const motionProgress = easedProgress * maxProgress;

  let startPoint = motionPoints[0];
  let endPoint = motionPoints[motionPoints.length - 1];
  let localProgress = 0;

  for (let index = 1; index < motionPoints.length; index += 1) {
    const nextPoint = motionPoints[index];
    if (motionProgress <= nextPoint.progress) {
      const previousPoint = motionPoints[index - 1];
      const segmentLength = nextPoint.progress - previousPoint.progress || 1;
      localProgress = (motionProgress - previousPoint.progress) / segmentLength;
      startPoint = previousPoint;
      endPoint = nextPoint;
      break;
    }
  }

  if (motionProgress >= motionPoints[motionPoints.length - 1].progress) {
    startPoint = motionPoints[motionPoints.length - 2] || motionPoints[0];
    endPoint = motionPoints[motionPoints.length - 1];
    localProgress = 1;
  }

  const xPoint = startPoint.x + (endPoint.x - startPoint.x) * localProgress;
  const yPoint = startPoint.y + (endPoint.y - startPoint.y) * localProgress;
  const rotateYPoint = startPoint.rotateY + (endPoint.rotateY - startPoint.rotateY) * localProgress;
  const rotateXPoint = startPoint.rotateX + (endPoint.rotateX - startPoint.rotateX) * localProgress;
  const sizePoint = startPoint.size + (endPoint.size - startPoint.size) * localProgress;

  const xOffset = xPoint * window.innerWidth * 0.7;
  const yOffset = yPoint * window.innerHeight * 0.24;

  cube.style.transform = `translate3d(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px), 0) scale(${sizePoint}) rotateX(${rotateXPoint}deg) rotateY(${rotateYPoint}deg) rotateZ(${easedProgress * 18}deg)`;
  cube.style.setProperty('--rot-x', `${rotateXPoint}deg`);
  cube.style.setProperty('--rot-y', `${rotateYPoint}deg`);
  cube.style.setProperty('--rot-z', `${easedProgress * 18}deg`);

  if (hero) {
    hero.style.position = 'relative';
    hero.style.zIndex = '2';
  }
}

let pendingFrame = false;

function handleScroll() {
  revealOnScroll();
  if (!pendingFrame) {
    pendingFrame = true;
    requestAnimationFrame(() => {
      updateCubeMotion();
      pendingFrame = false;
    });
  }
}

const navbar = document.querySelector('.navbar');
const navbarContrastSections = Array.from(document.querySelectorAll('[data-navbar-contrast="light"]'));
let navbarObserver = null;

function updateNavbarContrast(entries) {
  const isDarkVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0.1);
  if (!navbar) return;
  if (isDarkVisible) {
    navbar.classList.add('navbar--light');
  } else {
    navbar.classList.remove('navbar--light');
  }
}

function initNavbarContrastObserver() {
  if (!navbar || navbarContrastSections.length === 0) return;
  navbarObserver = new IntersectionObserver(updateNavbarContrast, {
    root: null,
    threshold: [0, 0.1, 0.25, 0.5],
  });
  navbarContrastSections.forEach(section => navbarObserver.observe(section));
}

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('load', () => {
  handleScroll();
  initNavbarContrastObserver();
});
window.addEventListener('resize', handleScroll);
handleScroll();

const counters = document.querySelectorAll(".count");

const animateCounter = (counter) => {
  const target = Number(counter.dataset.target);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";

  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);

    // Ease out
    const eased = 1 - Math.pow(1 - progress, 3);

    const value = Math.round(eased * target);

    counter.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      animateCounter(entry.target);
      observer.unobserve(entry.target); // animate only once
    });
  },
  {
    threshold: 0.5
  }
);

counters.forEach((counter) => observer.observe(counter));
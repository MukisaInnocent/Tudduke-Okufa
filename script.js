/* ===============================
   GLOBAL ENHANCEMENTS
================================ */

// Smooth fade-in on page load
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.8s ease-in-out";
  requestAnimationFrame(() => {
    document.body.style.opacity = "1";
  });
});

/* ===============================
   ACTIVE NAVIGATION HIGHLIGHT
================================ */
const navLinks = document.querySelectorAll("nav a");
const currentPage = location.pathname.split("/").pop();

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.fontWeight = "bold";
    link.style.textDecoration = "underline";
  }
});

/* ===============================
   SCROLL REVEAL ANIMATION
================================ */
const revealElements = document.querySelectorAll("section, .payment-card, article");

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 80) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
};

revealElements.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "all 0.6s ease";
});

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* ===============================
   DONATION PAGE INTERACTIONS
================================ */
const paymentCards = document.querySelectorAll(".payment-card");

paymentCards.forEach(card => {
  card.addEventListener("click", () => {
    card.style.border = "2px solid #c1121f";
    card.style.boxShadow = "0 0 25px rgba(193,18,31,0.5)";
  });
});

/* ===============================
   DYNAMIC YEAR IN FOOTER
================================ */
const footer = document.querySelector("footer");
if (footer) {
  footer.innerHTML = footer.innerHTML.replace("2025", new Date().getFullYear());
}

/* ===============================
   LIVE PAGE STATUS CHECK
================================ */
const iframe = document.querySelector("iframe");
if (iframe && iframe.src.includes("live_stream")) {
  const notice = document.createElement("p");
  notice.textContent = "🔴 Live stream will appear here when broadcast is active";
  notice.style.opacity = "0.8";
  notice.style.marginTop = "10px";
  iframe.parentElement.appendChild(notice);
}

/* ===============================
   SERMON PAGE AUTO-HIGHLIGHT
================================ */
const sermons = document.querySelectorAll("article");
if (sermons.length > 0) {
  sermons[0].style.borderLeft = "5px solid #b30000";
  sermons[0].style.paddingLeft = "15px";
}

/* ===============================
   VIDEO LAZY LOAD (PERFORMANCE)
================================ */
const videos = document.querySelectorAll("iframe");
videos.forEach(video => {
  video.setAttribute("loading", "lazy");
});

/* ===============================
   SUBTLE NAV HOVER EFFECT
================================ */
navLinks.forEach(link => {
  link.addEventListener("mouseenter", () => {
    link.style.opacity = "0.7";
  });
  link.addEventListener("mouseleave", () => {
    link.style.opacity = "1";
  });
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
    const res = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById('response').innerText = 'Message sent successfully!';
      document.getElementById('contactForm').reset();
    } else {
      document.getElementById('response').innerText = 'Error sending message';
    }

  } catch (err) {
    document.getElementById('response').innerText = 'Server not reachable';
  }
});

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
  menuButton.querySelector(".sr-only").textContent = isOpen ? "Open navigation" : "Close navigation";
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.querySelector(".sr-only").textContent = "Open navigation";
  });
});

// ----- Intersection observer for reveal animations -----
function observeReveal(root) {
  if (!("IntersectionObserver" in window)) {
    root.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -45px" },
  );
  root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

observeReveal(document);
document.getElementById("year").textContent = new Date().getFullYear();

// ----- Data-driven rendering -----
function projectDateLabel(p) {
  if (p.active) return `${p.startYear}—Present`;
  if (p.endYear === null || p.endYear === p.startYear) return String(p.startYear);
  return `${p.startYear}—${p.endYear}`;
}

function renderProjects(projects) {
  const list = document.getElementById("project-list");
  if (!list) return;

  list.innerHTML = projects
    .map((p) => {
      const dateLabel = projectDateLabel(p);
      const statusLabel = p.active ? "Active" : "Completed";
      const currentClass = p.active ? " project-current" : "";
      const funderLine = p.grantNo
        ? `${p.funder} · ${p.grantNo}`
        : p.funder;
      const amountLine = p.note
        ? `${p.amount} · ${p.note}`
        : p.amount;

      return `<article class="project${currentClass} reveal">
  <div class="project-date"><time>${dateLabel}</time><span>${statusLabel}</span></div>
  <div class="project-main">
    <h3>${p.title}</h3>
    <p>${funderLine}</p>
  </div>
  <div class="project-detail">
    <strong>${p.role}</strong>
    <span>${amountLine}</span>
  </div>
</article>`;
    })
    .join("\n");

  // Update active-project count in the About stat strip
  const countEl = document.getElementById("active-project-count");
  if (countEl) countEl.textContent = String(projects.filter((p) => p.active).length);

  observeReveal(list);
}

function renderPublications(publications) {
  const list = document.getElementById("publication-list");
  if (!list) return;

  list.innerHTML = publications
    .map((pub) => {
      // Escape & for HTML display; the JSON stores the plain character
      const journal = pub.journal.replace(/&/g, "&amp;");
      const authors = pub.authors.replace(/&/g, "&amp;");
      return `<a class="publication reveal" href="${pub.url}" target="_blank" rel="noreferrer">
  <div class="pub-meta"><span>${journal}</span><time>${pub.year}</time></div>
  <h3>${pub.title}</h3>
  <p>${authors}</p>
  <span class="pub-arrow" aria-hidden="true">↗</span>
</a>`;
    })
    .join("\n");

  observeReveal(list);
}

function renderConferences(conferences) {
  const list = document.getElementById("conference-list");
  if (!list) return;

  list.innerHTML = conferences
    .map((c) => {
      const venue = c.venue.replace(/&/g, "&amp;");
      const authors = c.authors.replace(/&/g, "&amp;");
      const locationPart = c.location ? `, ${c.location}` : "";
      const publisherPart = c.publisher ? ` · ${c.publisher}` : "";
      const meta = `${venue}${locationPart}${publisherPart}`;
      const tag = c.url ? "a" : "div";
      const href = c.url ? ` href="${c.url}" target="_blank" rel="noreferrer"` : "";
      return `<${tag} class="publication reveal"${href}>
  <div class="pub-meta"><span>${meta}</span><time>${c.year}</time></div>
  <h3>${c.title}</h3>
  <p>${authors}</p>
  ${c.url ? '<span class="pub-arrow" aria-hidden="true">↗</span>' : ""}
</${tag}>`;
    })
    .join("\n");

  observeReveal(list);
}

// Fetch data.json and populate sections
fetch("data.json")
  .then((r) => r.json())
  .then((data) => {
    renderProjects(data.projects);
    renderPublications(data.publications);
    if (data.conferences) renderConferences(data.conferences);
  })
  .catch((err) => console.error("Failed to load data.json:", err));

const films = [
  { id: "tracheal-stenosis", title: "Treatment of Post-Intubation Tracheal Stenosis with CRE Balloon Dilation and Silicone Stent Placement", youtubeId: "THTpqzmi_Bw", kind: "medical", additional: true, hasPoster: true },
  { id: "mps", title: "MPS", youtubeId: "EbJLsi2YSiU", kind: "medical", additional: true, hasPoster: false },
  { id: "ginger", title: "Ginger Cubics Master Film", youtubeId: "-r3Ox6lL1X4", kind: "product", description: "A KnitPro product film built around the geometry and wood grain of the Ginger Cubics range." },
  { id: "vibe", title: "Vybe Master Film", youtubeId: "GVSYhPD_Ls8", kind: "product", description: "A colourful KnitPro product film with bold type and graphic motion." },
  { id: "fetal", youtubeId: "u5-_TgJ32iU", title: "Fetal Positions", kind: "medical", description: "An anatomy explainer that uses a cutaway view to illustrate fetal positioning." },
  {"id": "lm-reel", title: "Lantern Moon CGI Reel", youtubeId: "mDn3mn6r28A", "kind": "product", "additional": true, "hasPoster": false},
  {"id": "symfonie", title: "Symfonie 2 Master Film", youtubeId: "0uTnIMJNp04", "kind": "product", "additional": true, "hasPoster": false},
  {"id": "tara-draft-4", title: "Tara Master Film", youtubeId: "J56ESa0BSv0", "kind": "product", "additional": true, "hasPoster": false},
  {"id": "vibe-teaser", title: "Vybe Teaser", youtubeId: "IKADs9O-9Mw", "kind": "product", "additional": true, "hasPoster": false},
  {"id": "cmc-arthritis", youtubeId: "28l5s2X7ufI", "title": "First CMC Joint Arthritis", "kind": "medical", "additional": true, "hasPoster": false},
  {"id": "anomaly", youtubeId: "-BR4doX3TSk", "title": "Anomaly Scan", "kind": "medical", "additional": false, "hasPoster": true},
  {"id": "laminotomy", youtubeId: "uOmWy19itHU", "title": "Endoscopic Lumbar Laminotomy", "kind": "medical", "additional": true, "hasPoster": true},
  {"id": "hfmd", youtubeId: "X-0RWPfyxrA", "title": "Hand, Foot, and Mouth Disease", "kind": "medical", "additional": true, "hasPoster": true},
];
const filmById = new Map(films.map(film => [film.id, film]));
const label = film => film.kind === "medical" ? "3D Medical Animation" : "3D Product Film";
const poster = film => film.hasPoster === false ? "" : "media/" + film.id + (film.kind === "medical" ? ".png" : ".jpg");
const card = document.querySelector("#card");
const dialog = document.querySelector("#player");
const video = dialog.querySelector("video");
const youtubePlayer = document.createElement("iframe");
youtubePlayer.hidden = true;
youtubePlayer.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
youtubePlayer.allowFullscreen = true;
youtubePlayer.referrerPolicy = "strict-origin-when-cross-origin";
Object.assign(youtubePlayer.style, { width: "100%", height: "100%", border: "0" });
video.after(youtubePlayer);
const youtubeLink = document.createElement("a");
youtubeLink.className = "pill outline";
youtubeLink.textContent = "Watch on YouTube";
youtubeLink.target = "_blank";
youtubeLink.rel = "noopener noreferrer";
youtubeLink.hidden = true;
dialog.querySelector(".film-controls").append(youtubeLink);
const status = document.querySelector("#playback-status");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
let playerFilms = films;
let activeFilm;

for (const film of films) {
  const gallery = document.querySelector('[data-gallery="' + film.kind + '"]');
  if (!gallery || (film.additional && !gallery.hasAttribute("data-show-all"))) continue;
  const item = card.content.cloneNode(true);
  const project = item.querySelector(".card");
  project.dataset.kind = film.kind;
  const button = item.querySelector("button");
  button.dataset.open = film.id;
  button.setAttribute("aria-label", "Explore " + film.title);
  const image = item.querySelector("img");
  const thumbnail = poster(film);
  if (thumbnail) {
    image.src = thumbnail;
  } else {
    image.hidden = true;
    const placeholder = item.querySelector(".preview-title");
    placeholder.textContent = film.title;
    placeholder.hidden = false;
  }
  item.querySelector("small").textContent = label(film);
  item.querySelector("strong").textContent = film.title;
  gallery.append(item);
}

function showFilm(film) {
  activeFilm = film;
  dialog.querySelector("#film-title").textContent = film.title;
  dialog.querySelector("#film-category").textContent = label(film);
  dialog.querySelector("#film-description").textContent = film.description || "";
  video.pause();
  status.hidden = true;
  const isYouTube = Boolean(film.youtubeId);
  video.hidden = isYouTube;
  youtubePlayer.hidden = !isYouTube;
  youtubeLink.hidden = !isYouTube;
  if (isYouTube) {
    video.removeAttribute("src");
    video.load();
    youtubePlayer.title = film.title;
    youtubePlayer.src = "https://www.youtube-nocookie.com/embed/" + film.youtubeId + "?autoplay=1&playsinline=1";
    youtubeLink.href = "https://youtu.be/" + film.youtubeId;
  } else {
    youtubePlayer.removeAttribute("src");
    video.classList.toggle("portrait", Boolean(film.portrait));
    const thumbnail = poster(film);
    if (thumbnail) video.poster = thumbnail;
    else video.removeAttribute("poster");
    video.src = "media/" + film.id + ".mp4";
  }
  previous.disabled = playerFilms.length < 2;
  next.disabled = playerFilms.length < 2;
  if (!dialog.open) dialog.showModal();
  featuredVideo?.pause();
  document.body.classList.add("film-open");
  if (!document.fullscreenElement && dialog.requestFullscreen) {
    dialog.requestFullscreen().catch(() => {});
  } else if (!isYouTube && !dialog.requestFullscreen && video.webkitEnterFullscreen) {
    try { video.webkitEnterFullscreen(); } catch {}
  }
  if (isYouTube) return;
  video.play().catch(() => {
    if (activeFilm !== film || !dialog.open) return;
    status.textContent = "Press play to start the film.";
    status.hidden = false;
  });
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-open]");
  if (!button) return;
  const film = filmById.get(button.dataset.open);
  playerFilms = Array.from(button.closest(".gallery").querySelectorAll("[data-open]"), card => filmById.get(card.dataset.open));
  showFilm(film);
});

function stepFilm(offset) {
  const index = playerFilms.indexOf(activeFilm);
  showFilm(playerFilms[(index + offset + playerFilms.length) % playerFilms.length]);
}
previous.addEventListener("click", () => stepFilm(-1));
next.addEventListener("click", () => stepFilm(1));
video.addEventListener("error", () => {
  if (!dialog.open || !video.hasAttribute("src")) return;
  status.textContent = "This film could not play. Open the extracted site in Chrome or Edge and keep the media folder beside index.html.";
  status.hidden = false;
});
dialog.querySelector(".close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  youtubePlayer.removeAttribute("src");
  document.body.classList.remove("film-open");
  if (document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
  video.pause();
  video.removeAttribute("src");
  video.load();
});

const form = document.querySelector("#brief");
document.querySelectorAll("[data-brief]").forEach(button => button.addEventListener("click", () => {
  form.elements.service.value = button.dataset.brief;
  document.querySelector("#contact").scrollIntoView();
  form.elements.name.focus({ preventScroll: true });
}));
const featuredVideo = document.querySelector("#tara-film");
if (featuredVideo) {
  const featuredPlay = document.querySelector("#tara-play");
  const featuredSound = document.querySelector("#tara-sound");
  const featuredStatus = document.querySelector("#tara-status");
  const opening = document.querySelector(".opening");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function playFeatured() {
    featuredVideo.play().catch(() => {});
  }
  function syncFeaturedControls() {
    featuredPlay.textContent = featuredVideo.paused ? "Play film" : "Pause film";
    featuredSound.textContent = featuredVideo.muted ? "Unmute" : "Mute";
  }
  featuredPlay.addEventListener("click", () => {
    if (featuredVideo.paused) playFeatured();
    else featuredVideo.pause();
  });
  featuredSound.addEventListener("click", () => {
    featuredVideo.muted = !featuredVideo.muted;
    if (!featuredVideo.muted && featuredVideo.paused) playFeatured();
  });
  for (const event of ["play", "pause", "volumechange"]) {
    featuredVideo.addEventListener(event, syncFeaturedControls);
  }
  featuredVideo.querySelector("source").addEventListener("error", () => {
    featuredStatus.textContent = "The featured film could not load.";
    featuredStatus.hidden = false;
  });
  if (!reducedMotion.matches && getComputedStyle(opening).visibility === "hidden") playFeatured();
  opening.addEventListener("animationstart", event => {
    if (event.target === opening && event.animationName === "opening-exit" && !reducedMotion.matches) playFeatured();
  });
  opening.addEventListener("animationend", event => {
    if (event.target === opening && !reducedMotion.matches) playFeatured();
  });
  dialog.addEventListener("play", event => {
    if (event.target === video) featuredVideo.pause();
  }, true);
}

// A single decorative cursor label shared by every film preview.
const exploreCursor = document.createElement("span");
exploreCursor.className = "explore-pill explore-cursor";
exploreCursor.innerHTML = 'Explore <span>&rarr;</span>';
exploreCursor.setAttribute("aria-hidden", "true");
document.body.append(exploreCursor);
const hoverPointer = matchMedia("(hover: hover) and (pointer: fine)");
function hideExplore() { exploreCursor.classList.remove("visible"); }
for (const surface of document.querySelectorAll(".card-button .frame")) {
  surface.addEventListener("pointermove", event => {
    if (!hoverPointer.matches || event.pointerType === "touch" || dialog.open) return;
    const halfWidth = exploreCursor.offsetWidth / 2;
    const halfHeight = exploreCursor.offsetHeight / 2;
    const x = Math.max(halfWidth, Math.min(event.clientX, window.innerWidth - halfWidth));
    const y = Math.max(halfHeight, Math.min(event.clientY, window.innerHeight - halfHeight));
    exploreCursor.style.left = x + "px";
    exploreCursor.style.top = y + "px";
    exploreCursor.classList.add("visible");
  });
  surface.addEventListener("pointerleave", hideExplore);
  surface.addEventListener("pointerdown", hideExplore);
}
window.addEventListener("scroll", hideExplore, { passive: true });
window.addEventListener("blur", hideExplore);
document.addEventListener("fullscreenchange", () => {
  hideExplore();
});

const defaultSettings = {
  hideShorts: true,
  hideFeatured: true,
  blacklist: [],
};

let settings = { ...defaultSettings };

function loadSettings() {
  return new Promise((resolve) => {
    browser.storage.sync.get(defaultSettings, (data) => {
      settings = data;
      resolve();
    });
  });
}

function cleanFeed() {
  if (settings.hideShorts) {
    cleanShorts();
  }

  if (settings.hideFeatured) {
    cleanFeatured();
  }

  filterVideos(); // Blacklist filtering
}

function cleanShorts() {
  const shortsShelf = document.querySelector(
    "ytd-rich-shelf-renderer[is-shorts]",
  );
  if (shortsShelf) {
    shortsShelf.remove();
  }
}

function cleanFeatured() {
  // I could not differentiate the featured section from other (non-shorts) shelves, so they will all have to go.
  const shelves = document.querySelectorAll(
    "ytd-rich-shelf-renderer:not([is-shorts])",
  );
  shelves.forEach((shelf) => shelf.remove());
}

async function filterVideos() {
  const videos = document.querySelectorAll("ytd-rich-item-renderer");

  videos.forEach((video) => {
    const title = video.querySelector("h3[title]");

    if (!title) return;

    const titleText = title.getAttribute("title").toLowerCase();

    const shouldHide = settings.blacklist.some((keyword) =>
      titleText.includes(keyword.toLowerCase()),
    );

    if (shouldHide) {
      video.remove();
    }
  });
}

async function init() {
  await loadSettings();

  const observer = new MutationObserver(cleanFeed);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  cleanFeed();
}

init();

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.blacklist) {
      settings.blacklist = changes.blacklist.newValue;
      filterVideos();
    }

    if (changes.hideShorts || changes.hideFeatured) {
      loadSettings().then(cleanFeed);
    }
  }
});

/*
Notes:

Shorts div selector: ytd-rich-shelf-renderer with is-shorts attribute
<ytd-rich-shelf-renderer class="style-scope ytd-rich-section-renderer" elements-per-row="5" is-shorts="" show-bottom-divider="" style="--ytd-rich-grid-items-per-row: 5; --ytd-rich-grid-item-margin: 16px; --ytd-rich-shelf-items-count: 12;" restrict-contents-overflow="" has-expansion-button=""><!--css-build:shady--><!--css_build_scope:ytd-rich-shelf-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="dismissible" class="style-scope ytd-rich-shelf-renderer">


Featured section selector:
<ytd-rich-shelf-renderer class="style-scope ytd-rich-section-renderer" elements-per-row="3" show-bottom-divider="" style="--ytd-rich-grid-items-per-row: 3; --ytd-rich-grid-item-margin: 16px; --ytd-rich-shelf-items-count: 12;" restrict-contents-overflow="" has-expansion-button=""><!--css-build:shady--><!--css_build_scope:ytd-rich-shelf-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><div id="dismissible" class="style-scope ytd-rich-shelf-renderer">
  <div id="rich-shelf-header-container" class="style-scope ytd-rich-shelf-renderer">
    <div id="rich-shelf-header" class="style-scope ytd-rich-shelf-renderer">
      <h2 class="style-scope ytd-rich-shelf-renderer">
        
*/

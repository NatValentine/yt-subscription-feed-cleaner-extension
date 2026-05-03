const shortsEl = document.getElementById("shorts");
const featuredEl = document.getElementById("featured");
const blacklistEl = document.getElementById("blacklist");

const defaultSettings = {
  hideShorts: true,
  hideFeatured: true,
  blacklist: [],
};

function loadSettings() {
  browser.storage.sync.get(defaultSettings, (data) => {
    shortsEl.checked = data.hideShorts;
    featuredEl.checked = data.hideFeatured;
    blacklistEl.value = data.blacklist.join(", ");
  });
}

function saveSettings() {
  const blacklist = blacklistEl.value
    .split(",")
    .map((w) => w.trim()) // Remove spaces around keywords
    .filter(Boolean); // Remove empty keywords

  browser.storage.sync.set({
    hideShorts: shortsEl.checked,
    hideFeatured: featuredEl.checked,
    blacklist,
  });
}

shortsEl.addEventListener("change", saveSettings);
featuredEl.addEventListener("change", saveSettings);
blacklistEl.addEventListener("input", saveSettings);

loadSettings();

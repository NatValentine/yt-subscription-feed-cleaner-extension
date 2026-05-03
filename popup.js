const shortsEl = document.getElementById("shorts");
const featuredEl = document.getElementById("featured");
const blacklistEl = document.getElementById("blacklist");
const whitelistEl = document.getElementById("whitelist");

const defaultSettings = {
  hideShorts: true,
  hideFeatured: true,
  blacklist: [],
  whitelist: [],
};

function loadSettings() {
  browser.storage.sync.get(defaultSettings, (data) => {
    shortsEl.checked = data.hideShorts;
    featuredEl.checked = data.hideFeatured;
    blacklistEl.value = data.blacklist.join(", ");
    whitelistEl.value = (data.whitelist || [])
      .map((rule) => `${rule.channel}: ${rule.include.join(", ")}`)
      .join("\n");
  });
}

function saveSettings() {
  const blacklist = blacklistEl.value
    .split(",")
    .map((w) => w.trim()) // Remove spaces around keywords
    .filter(Boolean); // Remove empty keywords

  const whitelist = parseWhitelist(whitelistEl.value);

  browser.storage.sync.set({
    hideShorts: shortsEl.checked,
    hideFeatured: featuredEl.checked,
    blacklist,
    whitelist,
  });
}

function parseWhitelist(value) {
  return value
    .split("\n")
    .map((line) => {
      const [channel, keywords] = line.split(":");

      if (!channel || !keywords) return null;

      return {
        channel: channel.trim().toLowerCase(),
        include: keywords
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean),
      };
    })
    .filter(Boolean);
}

shortsEl.addEventListener("change", saveSettings);
featuredEl.addEventListener("change", saveSettings);
blacklistEl.addEventListener("input", saveSettings);
whitelistEl.addEventListener("input", saveSettings);

loadSettings();

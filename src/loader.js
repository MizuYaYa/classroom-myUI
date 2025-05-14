(async () => {
  const src = chrome.runtime.getURL("script.js");
  await import(src);
})();

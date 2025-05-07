//@ts-check
"use strict";

const link = document.createElement("link");
link.rel = "stylesheet";
// @ts-ignore
link.href = `${chrome.runtime.getURL("style.css")}`;
document.head.appendChild(link);

// 配布された課題のheightを調整できるぐらいの親要素
const parentElement = document.getElementsByClassName("JZicYb");
// 授業タブ側のheightを調整できるぐらいの親要素
const ClassParentElement = document.getElementsByClassName("RcHwO");
// 課題の説明の要素
const textElements = document.getElementsByClassName("asQXV");
// 授業タブ側の課題の説明の要素
const textClassElements = document.getElementsByClassName("JvYRu");
// 授業毎の課題リストの要素識別
const taskListId = '[jscontroller="BRRzA"]';

function addClassInStreamTab() {
  for (const element of parentElement) {
    element.classList.add("set-height");
  }

  for (const element of textElements) {
    if (!(element.tagName === "SPAN" || element.parentElement?.className === "QRiHXd")) continue;
    element.classList.add("no-overflow-hidden");
  }
}

function addClassInClassTab() {
  for (const element of ClassParentElement) {
    element.classList.add("set-height");
  }

  for (const element of textClassElements) {
    element.classList.add("no-overflow-hidden");
  }
}

function updateClassTab(records) {
  const urlLocations = location.pathname.split("/");

  if (textClassElements.length > 0 && urlLocations[1] === "w") {
    addClassInClassTab();
  } else if (parentElement.length > 0 && urlLocations[1] === "c") {
    addClassInStreamTab();
  }
}

const observer = new MutationObserver(records => {
  updateClassTab(records);
});

// 課題リストの監視
const observingId = [];
setInterval(() => {
  for (const taskListElement of document.querySelectorAll(taskListId)) {
    if (observingId.includes(taskListElement.id)) continue;
    observer.observe(taskListElement, { childList: true });
    observingId.push(taskListElement.id);
    updateClassTab(taskListElement);
    if (observingId.length > 5) {
      observingId.shift();
    }
  }
}, 100);

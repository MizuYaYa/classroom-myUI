//@ts-check
"use strict";

const link = document.createElement("link");
link.rel = "stylesheet";
// @ts-ignore
link.href = `${chrome.runtime.getURL("style.css")}`;
document.head.appendChild(link);

// 配布された課題のheightを調整できるぐらいの親要素
const parentElement = document.getElementsByClassName("JZicYb");
// 課題の説明の要素
const textElements = document.getElementsByClassName("asQXV");

function addClass() {
  for (const element of parentElement) {
    element.classList.add("set-height");
  }

  for (const element of textElements) {
    if (!(element.tagName === "SPAN" || element.parentElement?.className === "QRiHXd")) continue;
    element.classList.add("no-overflow-hidden");
  }
}

const observer = new MutationObserver(records => {
  addClass();
});

let intervalId = 0;
intervalId = setInterval(() => {
  if (parentElement.length == 0) return;

  clearInterval(intervalId);
  addClass();

  // 課題のリスト
  const workList = parentElement[0].parentElement?.parentElement?.parentElement;
  if (workList) {
    observer.observe(workList, { childList: true });
  } else {
    console.warn("classroom-myUI: あれれ？classroomの構造が変わったかもしれません");
  }
}, 200);

//@ts-check

import { createInfoBarElementInStreamTab, createInfoElementInClassTab } from "./createElement.js";

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

/**
 * @typedef descriptionData
 * @property {string} author 投稿者
 * @property {string} [serviceName] 使用サービス名
 * @property {string} title 課題タイトル
 */

/**
 * @param {string} description
 * @returns {descriptionData | null}
 */
function parseClassDescription(description) {
  const まほうの正規表現 =
    /^(?<author>.+) さんが(?: (?<serviceName>.+) を使用して)?新しい課題を投稿しました: (?<title>.+)$/;
  const match = description.match(まほうの正規表現);

  if (!match || !match.groups) return null;

  return {
    author: match.groups.author,
    serviceName: match.groups.serviceName,
    title: match.groups.title,
  };
}

function addClassInStreamTab() {
  for (const element of parentElement) {
    element.classList.add("set-height");

    // ここでelementの子要素descriptionを取得
    /** @type {HTMLSpanElement | null} */
    const description = element.querySelector("span.asQXV");
    if (!description) throw new Error("課題説明文の要素が見つかりませんでした。");

    // 取得したdescriptionをparseClassDescriptionに渡す
    const parsedDescription = parseClassDescription(description.innerText);
    if (!parsedDescription) throw new Error("課題説明文が正しく解析できませんでした。");

    description.innerText = parsedDescription.title;

    const infoBarElement = createInfoBarElementInStreamTab(parsedDescription);

    element.parentElement?.appendChild(infoBarElement);
  }

  for (const element of textElements) {
    if (!(element.tagName === "SPAN" || element.parentElement?.className === "QRiHXd")) continue;
    element.classList.add("no-overflow-hidden");
  }
}

function addClassInClassTab() {
  for (const element of ClassParentElement) {
    if (element.classList.contains("set-height")) continue;
    element.classList.add("set-height");

    // ここでelementの子要素descriptionを取得
    /** @type {HTMLDivElement | null} */
    const description = element.querySelector("div.JvYRu");
    if (!description) throw new Error("課題説明文の要素が見つかりませんでした。");

    const parsedDescription = parseClassDescription(description.innerText);
    if (!parsedDescription) throw new Error("課題説明文が正しく解析できませんでした。");

    description.innerText = parsedDescription.title;

    const infoElement = createInfoElementInClassTab(parsedDescription);

    const infoSpaceElement = element.parentElement?.querySelector(".RL2eP");
    if (!infoSpaceElement) throw new Error("課題説明文の兄弟要素である情報要素が見つかりませんでした。");
    infoSpaceElement.classList.add("flex-column");

    infoSpaceElement.appendChild(infoElement);
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

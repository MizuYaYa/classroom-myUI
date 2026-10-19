//@ts-check

import { createInfoBarElementInStreamTab, createInfoElementInClassTab } from "./createElement.js";

const link = document.createElement("link");
link.rel = "stylesheet";
// @ts-ignore
link.href = `${chrome.runtime.getURL("style.css")}`;
document.head.appendChild(link);

// // 配布された課題のheightを調整できるぐらいの親要素
// const parentElement = document.getElementsByClassName("JZicYb");
// // 課題の説明の要素
// const textElements = document.getElementsByClassName("asQXV");

// // 授業タブ側のheightを調整できるぐらいの親要素
// const classParentElement = document.getElementsByClassName("RcHwO");
// // 授業タブ側の課題の説明の要素
// const textClassElements = document.getElementsByClassName("JvYRu");

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

/**
 *
 * @param {HTMLCollectionOf<Element>} parentElement
 */
function addClassInStreamTab(parentElement) {
  console.log("waking");

  for (const element of parentElement) {
    element.classList.add("set-height");

    // ここでelementの子要素descriptionを取得
    /** @type {HTMLSpanElement | null} */
    const description = element.querySelector("span.Vu2fZd.VjRxGc");
    if (!description) throw new Error("課題説明文の要素が見つかりませんでした。");
    description.classList.add("no-overflow-hidden");

    // 取得したdescriptionをparseClassDescriptionに渡す
    const parsedDescription = parseClassDescription(description.innerText);
    if (!parsedDescription) throw new Error("課題説明文が正しく解析できませんでした。");

    description.innerText = parsedDescription.title;

    const infoBarElement = createInfoBarElementInStreamTab(parsedDescription);

    element.parentElement?.appendChild(infoBarElement);
  }
}

/**
 *
 * @param {HTMLCollectionOf<Element>} classParentElement
 */
function addClassInClassTab(classParentElement) {
  for (const element of classParentElement) {
    // if (element.classList.contains("set-height")) continue;
    element.classList.add("set-height");

    // ここでelementの子要素descriptionを取得
    /** @type {HTMLDivElement | null} */
    const description = element.querySelector("div.JvYRu");
    if (!description) throw new Error("課題説明文の要素が見つかりませんでした。");
    description.classList.add("no-overflow-hidden");

    const parsedDescription = parseClassDescription(description.innerText);
    if (!parsedDescription) throw new Error("課題説明文が正しく解析できませんでした。");

    description.innerText = parsedDescription.title;

    const infoElement = createInfoElementInClassTab(parsedDescription);

    const infoSpaceElement = element.parentElement?.querySelector(".RL2eP");
    if (!infoSpaceElement) throw new Error("課題説明文の兄弟要素である情報要素が見つかりませんでした。");
    infoSpaceElement.classList.add("flex-column");

    infoSpaceElement.appendChild(infoElement);
  }
}

/**
 *
 * @param {Element} taskList
 */
function updateClassTab(taskList) {
  const urlLocations = location.pathname.split("/");
  const parentElement = taskList.getElementsByClassName("JZicYb");
  const classParentElement = taskList.getElementsByClassName("RcHwO");
  // console.log(`${parentElement.length}個課題の親要素`);
  // console.log(`${classParentElement.length}個のクラス別課題の親要素`);

  if (classParentElement.length > 0 && urlLocations[1] === "w") {
    addClassInClassTab(classParentElement);
  } else if (parentElement.length > 0 && urlLocations[1] === "c") {
    addClassInStreamTab(parentElement);
  } else {
    console.log(`task list element not found in [${urlLocations[1]}] page`);
  }
}

const observer = new MutationObserver(records => {
  // console.log("mutation event!", records);
  const taskLists = document.querySelectorAll(taskListId);
  for (const taskList of taskLists) {
    try {
      updateClassTab(taskList);
    } catch (error) {
      console.log(error);
    }
  }
});

const urlChangeObserver = new MutationObserver(records => {
  // console.log("urlChange mutation event!", records);
  const urlLocations = location.pathname.split("/");
  const currentTitle = records[0].addedNodes[0].textContent;
  const previousTitle = records[0].removedNodes[0].textContent;
  if (currentTitle === previousTitle) return;
  if (urlLocations[1] === "w" && urlLocations[3] !== "tc") return;
  console.log("new page!", previousTitle, "]to[", currentTitle);

  const initIntervalId = setInterval(() => {
    const taskLists = document.querySelectorAll(taskListId);
    const newTaskLists = [];
    for (const [_, taskList] of taskLists.entries()) {
      if (observingTasklistId.includes(taskList.id)) continue;
      newTaskLists.push(taskList);
    }

    if (newTaskLists.length === 0) return;
    const taskListsByClass = [];
    for (const [_, taskList] of newTaskLists.entries()) {
      taskListsByClass.push(...taskList.getElementsByClassName("RcHwO"));
    }
    if (urlLocations[1] === "w" && taskListsByClass.length === 0) return;

    clearInterval(initIntervalId);
    console.log(`detected ${newTaskLists.length} new tasklist in ${taskLists.length} tasklist`);
    // 変更自体は全ての課題リストに対して行う
    for (const taskList of taskLists) {
      // console.log("edit target ", taskList);
      try {
        updateClassTab(taskList);
      } catch (error) {
        console.log(error);
      }
    }
    console.log("dom edit complete");

    // 課題リストを監視する
    for (const taskList of newTaskLists) {
      observer.observe(taskList, { childList: true });
      observingTasklistId.push(taskList.id);
    }
  }, 100);
});

// 課題リストの要素識別(BRRzAのクラス名がある同じタグ内)のidで特定する
// フラグは一貫性がないので、変更監視中の課題リストを二重に監視しないようにidでやる

// 初期サイトアクセスロード時はsetIntervalで[jsmodel='MM32ve']の出現を待つ

// 継続して監視するのは
// ・課題リストのコンテナ(課題追加時にスタイルを適用するため)
// ・URL(ソフト遷移時に別クラスの未適用課題リストが追加される可能性があるため)

//気をつけるのは、初期リロードの動的生成待ちと、URL遷移時のページ生成待ち

// TODO:  課題が変更済みなのかを検証する関数は作りたい。
// TODO: 現在のページの課題だけスタイルを適用する動作の方がいいかも

/**
 * @type string[]
 */
const observingTasklistId = [];
const initIntervalId = setInterval(() => {
  const taskList = document.querySelector(taskListId);
  if (taskList) {
    clearInterval(initIntervalId);

    updateClassTab(taskList);
    console.log("dom first edit complete");

    observer.observe(taskList, { childList: true });
    observingTasklistId.push(taskList.id);
  } else {
    clearInterval(initIntervalId);
    console.log("tasklist is not detected");
  }

  const title = document.querySelector("title");
  if (!title) throw new Error("titleないよ");
  urlChangeObserver.observe(title, { childList: true });
}, 100);

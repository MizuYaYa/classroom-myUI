// @ts-check

/**
 * @description 課題の下部に表示する要素を作成する
 * @param {Omit<import("./script.js").descriptionData, "title">} infoData
 */
export function createInfoBarElementInStreamTab(infoData) {
  const infoBarElement = document.createElement("div");
  infoBarElement.classList.add("info-bar");

  if (infoData.serviceName) {
    const serviceNameElement = document.createElement("img");
    // @ts-ignore
    serviceNameElement.src = chrome.runtime.getURL("img/manufacturing.svg");
    serviceNameElement.alt = `${infoData.serviceName} を使用して投稿`

    const serviceNameTooltipContainerElement = document.createElement("div");
    serviceNameTooltipContainerElement.classList.add("tooltip");

    const serviceNameTooltipElement = document.createElement("span");
    serviceNameTooltipElement.classList.add("tooltip-text");
    serviceNameTooltipElement.innerText = `${infoData.serviceName} を使用して投稿`;

    serviceNameTooltipContainerElement.appendChild(serviceNameTooltipElement);
    serviceNameTooltipContainerElement.appendChild(serviceNameElement);
    infoBarElement.appendChild(serviceNameTooltipContainerElement);
  }

  const authorPElement = document.createElement("p");
  authorPElement.innerText = infoData.author;

  infoBarElement.appendChild(authorPElement);

  return infoBarElement;
}

/**
 * @description 課題の情報スペースに表示する要素を作成する
 * @param {Omit<import("./script.js").descriptionData, "title">} infoData
 */
export function createInfoElementInClassTab(infoData) {
  const infoElement = document.createElement("div");
  infoElement.classList.add("cx8Okb", "dDKhVc");

  infoElement.innerText = `投稿者: ${infoData.author} ${infoData.serviceName ? `(${infoData.serviceName})` : ""}`;

  return infoElement;
}

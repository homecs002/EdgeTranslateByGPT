// 后台脚本
const TRANSLATION_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"; // 替换为通义千问 API 地址
const API_KEY = ""; // 替换为你的 API 密钥
const MODEL = "qwen-max"; // 替换为你的模型
const PROMPT = "你是经验丰富的翻译，请把以下计算机科学和人工智能领域的段落翻译成中文，并同时充分考虑中文的语法、清晰、简洁和整体可读性，必要时，你可以修改整个句子的顺序以确保翻译后的段落符合中文的语言习惯，并且保留专业词汇的英文版本。注意，如果文本里有agent，请翻译成“智能体”，“Prompt”、“token”、“tokens”不用翻译。特别的，如果文本只有一个单词，则只需要翻译这个单词（给出尽可能多的译文）并给出英语的国际音标即可，并且，除了翻译的内容，不要有多余的回答。你需要翻译的文本如下："; // 指定的 Prompt

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "translate",
    title: "EdgeTranslateByGPT",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => { // 将回调函数声明为 async
  if (info.menuItemId === "translate") {
    console.log("Translate menu item clicked");
    const selectedText = info.selectionText;

    console.log("API Key:", API_KEY);
    console.log("Model:", MODEL);
    console.log("Selected Text:", selectedText);

    try {
      const response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: `${PROMPT} ${selectedText}` }],
          targetLanguage: 'zh' // 根据需求设置目标语言
        })
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      // 确保正确获取翻译结果
      const translation = responseData.choices && responseData.choices[0] && responseData.choices[0].message && responseData.choices[0].message.content;
      if (!translation) {
        console.error('翻译结果为空或格式不正确:', responseData);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showTranslation,
        args: [translation]
      });
    } catch (error) {
      console.error('翻译失败:', error);
    }
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'translate') {
    const { text } = message;

    console.log("API Key:", API_KEY);
    console.log("Model:", MODEL);
    console.log("Text:", text);

    try {
      const response = await fetch(TRANSLATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: `${PROMPT} ${text}` }],
          targetLanguage: 'zh' // 根据需求设置目标语言
        })
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);

      // 确保正确获取翻译结果
      const translation = responseData.choices && responseData.choices[0] && responseData.choices[0].message && responseData.choices[0].message.content;
      if (!translation) {
        console.error('翻译结果为空或格式不正确:', responseData);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: showTranslation,
        args: [translation]
      });
    } catch (error) {
      console.error('翻译失败:', error);
    }
  }
});

// 在网页上显示翻译结果
function showTranslation(translation) {
  console.log("Showing translation:", translation);
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const div = document.createElement('div');
  div.textContent = translation;
  div.style.position = 'fixed';
  div.style.backgroundColor = 'rgba(0,0,0,0.8)';
  div.style.color = 'white';
  div.style.padding = '10px';
  div.style.borderRadius = '5px';
  div.style.top = `${rect.bottom + window.scrollY}px`;
  div.style.left = `${rect.right + window.scrollX}px`;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 5000);
}

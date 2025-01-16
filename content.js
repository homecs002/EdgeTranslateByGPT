// 网页内容脚本
// 负责检测网页上的选中文本，并发送到后台脚本或直接调用翻译 API。
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      // chrome.runtime.sendMessage({ type: 'translate', text: selectedText });
    }
  });

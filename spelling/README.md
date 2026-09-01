# G3 拼字王

學校發的 **G3 Spelling Bee Words（2025）** 單字表，做成可以自己背的網頁。
300 個字，25 個一組共 12 組。

**線上瀏覽**
- https://grade3-toolbox.pages.dev/spelling/
- https://rafaelhou.github.io/grade3-toolbox/spelling/

## 三個模式

| 模式 | 用途 |
|---|---|
| **依序介紹** | 一次一個字，照單字表原本的順序走。大字顯示、中文意思、發音鈕，可標「我會了」 |
| **單字表** | 整組列出，每個字都能單獨發音，也可以「整組念一遍」 |
| **拼字練習** | 只聽發音（附中文提示）把字拼出來。答對自動記成學會，答錯顯示正確拼法 |

## 功能

- **發音**：瀏覽器內建的 Web Speech API，不連任何外部服務。語速固定 0.85 倍，比正常慢一點
- **進度**：學會的字存在 localStorage，不上傳、不需帳號。換裝置要重新開始
- **等級**：依學會比例從 🐣 到 🏆 五級
- **鍵盤**：`←` `→` 換字，`空白鍵` 再念一次
- **深色／淺色**：預設跟隨系統，可手動覆蓋

## 檔案

```
index.html   頁面骨架
style.css    沿用工具箱的色彩變數，主色改青綠
words.js     單字庫（唯一需要維護的內容檔）
app.js       分組、卡片、單字表、拼字練習、發音、進度
favicon.svg
```

### 改單字

只改 `words.js`，分組、進度總數、練習題都會自動跟上。

```js
{ w: 'admire', z: '欽佩、讚賞' }
```

`window.GROUP_SIZE` 控制一組幾個字，目前是 25（300 字剛好 12 組）。
改這個數字就好，分組、進度條、練習題都會跟著算。**已經學會的字不會跑掉**——
進度是用單字在陣列裡的絕對位置存的，不是「第幾組第幾個」，所以換分組方式仍然對得上。

改組數只要動這個值，程式會自動重新分組。但檔案裡的 `// ── 第 N 組` 註解不會跟著跑，
記得一併重排，否則註解會和實際分組對不起來。

### 核對紀錄

單字是從紙本照片逐格辨認的，兩頁都已用清晰照片核對完成（2026-08），共 300 條。

第一次辨認時第二頁照片太糊，錯了 6 處、漏了 4 個字，重拍後修正：

| 編號 | 誤 | 正 |
|---|---|---|
| 169 | recognize | collection |
| 196 | （漏） | management |
| 199–201 | preschool, brightness, boneless | passable, brightness, preschool |
| 208 | （漏） | pleasing |
| 234–235 | classify, elevation | elevation, classify |
| 237 | （漏） | continental |
| 243 | （漏） | organism |
| 250–251 | adaptation, influence | influence, adaptation |

**教訓**：翻拍的單字表一定要能逐格看清編號才動手，糊掉的照片會讓順序整段錯位——
而順序錯位比單字打錯更難發現，因為每個字看起來都是對的。

## 為什麼沒有注音

工具箱其他頁面全文標注音，這一頁沒有。原因是本頁 616 個中文字裡，
現有字庫（`../zhuyin.js` + `../zhuyin-extra.js`）只蓋得到 62%，缺 235 字。
依照工具箱的原則「半標半不標比完全不標更難讀」，先整頁不標。

要補的話，把 235 個缺字加進 `../zhuyin-extra.js`，再於 `index.html`
末尾依序載入 `../zhuyin.js`、`../zhuyin-extra.js`、`../zhuyin-run.js` 即可。
缺字清單可以用這段跑出來：

```js
// 在本頁 console 執行（需先載入字庫）
const C = window.ZHUYIN.CHARS;
let t = window.WORDS.map(w => w.z).join('');
document.querySelectorAll('h1,h2,h3,p,li,button,span').forEach(e => t += e.textContent);
console.log([...new Set([...t].filter(c => /[一-鿿]/.test(c) && !C[c]))].join(''));
```

## 語音

用瀏覽器內建語音，沒有英文語音套件時頁面會跳提示。
Windows 可到「設定 → 時間與語言 → 語音」加裝英文語音，加完重開瀏覽器。
Chrome、Edge、Safari 都支援；部分瀏覽器的語音清單是非同步載入的，
所以程式有掛 `voiceschanged` 事件重新挑選。

## 內容來源

單字取自學校發的 G3 Spelling Bee Words（2025）。
中文意思為個人整理，僅供背誦參考，實際用法以課堂與字典為準。

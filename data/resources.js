/* 三年級工具箱 · 資源清單
   每一個連結都在 2026-08-07 實際打開確認過。
   schema: {t 名稱, u 網址, d 說明, lang 語言, acc 帳號需求, warn 限制} */

window.SUBJECTS = [

{
  id: 'chinese', name: '國語', icon: '📖',
  lead: '三年級的字變多、變難，開始碰成語與短文寫作。查得到、查得快，比背起來重要。',
  groups: [
    { kind: 'play', title: '動手玩', note: '全部免費、不用註冊', items: [
      { t: '教育部筆順學習網', u: 'https://stroke-order.learningweb.moe.edu.tw/',
        d: '任何一個字，輸入就會一筆一畫演給你看。三年級開始筆順錯了很難改回來，有疑問當場查最省事。',
        lang: '中文', acc: '免費' },
      { t: '教育部國語小字典', u: 'https://dict.mini.moe.edu.tw/',
        d: '專門為國小生做的字典，解釋比大人用的辭典淺得多。孩子可以自己查。',
        lang: '中文', acc: '免費' },
      { t: '萌典', u: 'https://www.moedict.tw/',
        d: '查字最快的介面，手機上特別順。同一個字還能切換台語、客語發音。',
        lang: '中文', acc: '免費' },
      { t: '教育部成語典', u: 'https://dict.idioms.moe.edu.tw/',
        d: '三年級開始出現成語。這裡有典故全文與例句。',
        lang: '中文', acc: '免費',
        warn: '內容是給大人看的深度，建議陪著一起讀。' }
    ]},
    { kind: 'read', title: '讀與聽', note: '', items: [
      { t: '文化部兒童文化館 · 繪本花園', u: 'https://children.moc.gov.tw/',
        d: '有聲繪本，一邊聽一邊看字。適合還不太願意自己讀長篇的孩子。',
        lang: '中文', acc: '免費' },
      { t: '國語日報', u: 'https://www.mdnkids.com/',
        d: '給小學生看的新聞，用字淺、篇幅短。是銜接「課本以外的閱讀」很自然的一步。',
        lang: '中文', acc: '部分免費',
        warn: '網站上大部分完整內容要訂閱，免費區塊有限。' }
    ]}
  ]
},

{
  id: 'math', name: '數學', icon: '🔢',
  lead: '三年級是分水嶺：乘除法變複雜、開始學分數、面積與周長登場。這一年最需要「摸得到」的東西。',
  groups: [
    { kind: 'play', title: '動手玩', note: '排在影片前面，因為數學看不會，要動手', items: [
      { t: 'Mathigon Polypad', u: 'https://mathigon.org/polypad',
        d: '一整箱數位教具：分數條、七巧板、天平、數線、骰子。三年級的分數和乘除法在這裡全部摸得到。<b>如果只能開一個連結，開這個。</b>',
        lang: '有繁中', acc: '免費' },
      { t: '均一教育平台', u: 'https://www.junyiacademy.org/',
        d: '台灣自製，直接對到課綱章節，影片加練習題。哪一章卡住就去搜哪一章。',
        lang: '中文', acc: '免費',
        warn: '不登入也能看影片、做題目；要記錄進度才需要註冊。' },
      { t: 'Toy Theater', u: 'https://toytheater.com/',
        d: '虛擬教具：計數積木、分數圓、時鐘、錢幣。把課本上的插圖變成能拖能動的東西。',
        lang: '英文介面', acc: '免費' },
      { t: 'Math Playground', u: 'https://www.mathplayground.com/',
        d: '大量小遊戲，依年級分類。三年級重點放在乘除法與分數那幾區。',
        lang: '英文介面', acc: '免費', warn: '有廣告。' },
      { t: 'Coolmath4Kids', u: 'https://www.coolmath4kids.com/',
        d: '把練習包在遊戲裡。介面是英文，但操作直覺到不太需要讀字。',
        lang: '英文介面', acc: '免費', warn: '有廣告。' },
      { t: 'Which One Doesn\'t Belong?', u: 'https://wodb.ca/',
        d: '一張圖四個東西，問哪一個不一樣——<b>四個答案都對，重點是說出理由。</b>很適合用來打破「數學只有一個標準答案」的印象。',
        lang: '圖為主', acc: '免費' },
      { t: 'NRICH（劍橋大學）', u: 'https://nrich.maths.org/primary',
        d: '開放式數學題，沒有固定解法。給已經覺得課本太簡單的孩子。',
        lang: '英文', acc: '免費',
        warn: '題目要讀英文，多半需要大人翻譯或陪讀。' },
      { t: '數感實驗室', u: 'https://numeracy.club/',
        d: '台灣團隊做的數學素養內容，把數學接回生活裡的問題。',
        lang: '中文', acc: '部分免費' }
    ]},
    { kind: 'video', title: '影片', note: '當引子用，不是主力', items: [
      { t: 'Numberblocks', u: 'https://www.youtube.com/@Numberblocks',
        d: '用積木人物演出數與運算，是低中年級公認的神作。英文，但幾乎不用聽也看得懂。',
        lang: '英文', acc: '免費' },
      { t: 'Math Antics', u: 'https://www.youtube.com/@mathantics',
        d: '一個觀念一支影片，講得非常白。卡在某個單元時去搜那個關鍵字。',
        lang: '英文', acc: '免費', warn: '需要開字幕，語速偏中等。' }
    ]}
  ]
},

{
  id: 'english', name: '英語', icon: '🔤',
  lead: '多數縣市從三年級開始上英語。這個階段的目標是「敢開口、聽得懂一點」，不是背單字量。',
  groups: [
    { kind: 'play', title: '動手玩', note: '', items: [
      { t: 'Cool English 英語線上學習平台', u: 'https://www.coolenglish.edu.tw/',
        d: '教育部出資做的，有國小專區，<b>全中文介面</b>——孩子自己就能操作，不會卡在看不懂選單。',
        lang: '中文介面', acc: '免費',
        warn: '部分遊戲與成績記錄需要註冊。' },
      { t: 'Starfall', u: 'https://www.starfall.com/',
        d: '從字母到自然發音（phonics）一路帶。三年級剛開始學發音規則，這個切入點剛好。',
        lang: '英文', acc: '免費區夠用',
        warn: '有付費會員區，免費區內容已足夠入門。' },
      { t: 'British Council LearnEnglish Kids', u: 'https://learnenglishkids.britishcouncil.org/',
        d: '英國文化協會官方，歌曲、故事、遊戲、學習單都有，分級清楚。',
        lang: '英文', acc: '免費' },
      { t: 'ABCya', u: 'https://www.abcya.com/',
        d: '依年級分類的英語小遊戲，選 Grade 3 就好。',
        lang: '英文', acc: '免費', warn: '免費版有廣告，部分內容需付費。' },
      { t: 'Oxford Owl 免費電子書庫', u: 'https://www.oxfordowl.co.uk/for-home/find-a-book/library-page/',
        d: '牛津大學出版社的分級英文繪本，可以線上聽朗讀。依難度找書很方便。',
        lang: '英文', acc: '需免費註冊' }
    ]},
    { kind: 'video', title: '影片', note: '', items: [
      { t: 'Storyline Online', u: 'https://storylineonline.net/',
        d: '演員朗讀英文繪本，配上動畫。發音清楚、表情豐富，聽不懂也看得下去。',
        lang: '英文', acc: '免費' },
      { t: 'StoryBots', u: 'https://www.youtube.com/@StoryBotsOfficial',
        d: '把常識唱成歌，歌詞簡單重複，很容易跟著哼。',
        lang: '英文', acc: '免費' }
    ]}
  ]
},

{
  id: 'social', name: '社會', icon: '🗺️',
  lead: '社會從三年級才開始上，第一個單元通常是「我住的地方」。從自己家往外擴，是最好的切入點。',
  groups: [
    { kind: 'play', title: '動手玩', note: '', items: [
      { t: 'Google Earth', u: 'https://earth.google.com/web/',
        d: '直接飛到任何地方，看衛星影像和街景。<b>先找自己家，再找學校，再找外婆家</b>——比課本上的地圖有感一百倍。',
        lang: '中文', acc: '免費' },
      { t: '臺灣百年歷史地圖', u: 'http://gissrv4.sinica.edu.tw/gis/twhgis/',
        d: '中研院做的，可以把一百年前的老地圖疊在現在的地圖上，拉一下滑桿看同一個地方怎麼變。<b>看自己家以前是什麼，孩子會盯很久。</b>',
        lang: '中文', acc: '免費',
        warn: '介面偏舊，第一次操作需要大人帶一下。' },
      { t: '國土測繪圖資服務雲', u: 'https://maps.nlsc.gov.tw/',
        d: '官方地圖，可以疊圖層看地形、行政區界線。查「我們在哪一區」很準。',
        lang: '中文', acc: '免費' },
      { t: 'Seterra 地圖測驗', u: 'https://www.seterra.com/',
        d: '認縣市、認國家的測驗遊戲，答錯會重複出現直到記起來。可切中文。',
        lang: '有中文', acc: '免費' },
      { t: '中央氣象署', u: 'https://www.cwa.gov.tw/',
        d: '即時天氣、颱風路徑、地震報告。社會和自然都會用到，颱風天特別有動機看。',
        lang: '中文', acc: '免費' }
    ]},
    { kind: 'video', title: '影片', note: '', items: [
      { t: 'Nat Geo Kids', u: 'https://www.youtube.com/@NatGeoKids',
        d: '國家地理的兒童版，世界各地與動物。畫面好，英文語速適中。',
        lang: '英文', acc: '免費' },
      { t: 'Free School', u: 'https://www.youtube.com/@FreeSchool',
        d: '用小學生聽得懂的英文講歷史、藝術與自然，語速慢、用字簡單。',
        lang: '英文', acc: '免費' }
    ]}
  ]
},

{
  id: 'science', name: '自然', icon: '🔬',
  lead: '自然也從三年級開始。這一科最怕變成背名詞——能動手調參數、能查到真實照片的資源優先。',
  groups: [
    { kind: 'play', title: '動手玩', note: '', items: [
      { t: 'PhET 互動模擬', u: 'https://phet.colorado.edu/zh_TW/',
        d: '科羅拉多大學做的科學模擬，<b>有繁體中文</b>。三年級可以玩「聲音」「力與運動」「電路組裝」的基礎版，拉參數看結果怎麼變。',
        lang: '有繁中', acc: '免費' },
      { t: '認識植物', u: 'https://kplant.atfr.org.tw/',
        d: '莊溪老師畢生整理的台灣植物圖鑑，照片多到誇張。路邊看到什麼花，回家查得到。',
        lang: '中文', acc: '免費',
        warn: '原網站已停止維運，現由臺灣山林復育協會接手維護。' },
      { t: 'Solar System Scope', u: 'https://www.solarsystemscope.com/',
        d: '3D 太陽系，可以拉時間軸看行星怎麼繞。想像不出來的東西，轉一轉就懂了。',
        lang: '英文介面', acc: '免費' },
      { t: 'TaiBIF 台灣生物多樣性', u: 'https://portal.taibif.tw/',
        d: '查台灣有哪些生物，附照片與分布地圖。做自然觀察報告很好用。',
        lang: '中文', acc: '免費' },
      { t: '臺灣物種名錄', u: 'https://taicol.tw/',
        d: '更完整的物種資料庫。想查到底、查學名時用這個。',
        lang: '中文', acc: '免費',
        warn: '偏學術，適合大人代查。' },
      { t: '臺北市立天文科學教育館', u: 'https://www.tam.gov.taipei/',
        d: '天象資訊與展覽活動。查「這個月看得到什麼」然後晚上真的去看。',
        lang: '中文', acc: '免費' },
      { t: '國立自然科學博物館', u: 'https://www.nmns.edu.tw/',
        d: '展覽資訊與線上教育資源。去之前先查，看展會很不一樣。',
        lang: '中文', acc: '免費' }
    ]},
    { kind: 'video', title: '影片', note: '', items: [
      { t: 'LIS 情境科學教材', u: 'https://www.youtube.com/@lisscience',
        d: '台灣團隊做的，把科學發現的過程拍成故事——<b>中文，而且講的是「當初怎麼想到的」</b>，不是結論。',
        lang: '中文', acc: '免費' },
      { t: 'SciShow Kids', u: 'https://www.youtube.com/@SciShowKids',
        d: '一集回答一個「為什麼」，三到五分鐘。英文語速慢，配圖清楚。',
        lang: '英文', acc: '免費' },
      { t: 'Peekaboo Kidz', u: 'https://www.youtube.com/@peekabookidz',
        d: 'Dr. Binocs 系列，一集講一個科學主題，動畫節奏快。',
        lang: '英文', acc: '免費' }
    ]}
  ]
},

{
  id: 'code', name: '程式與邏輯', icon: '🧩', extra: true,
  lead: '三年級課表上還沒有這一科，但這是最容易「自己愈玩愈深」的一塊，放在這裡當加碼。',
  groups: [
    { kind: 'play', title: '動手玩', note: '全部有繁體中文', items: [
      { t: 'Blockly Games', u: 'https://blockly.games/?lang=zh-hant',
        d: '用積木寫程式，從走迷宮開始，一關一關變難。<b>不用註冊、有繁體中文</b>，第一次接觸程式最順的入口。',
        lang: '繁體中文', acc: '免費' },
      { t: 'Scratch', u: 'https://scratch.mit.edu/',
        d: 'MIT 做的，用積木做動畫和小遊戲。可以直接玩不註冊，想存作品才需要帳號。',
        lang: '有繁中', acc: '免費' },
      { t: 'Code.org', u: 'https://code.org/',
        d: '「一小時玩程式」的主辦單位，關卡設計成熟，有中文。',
        lang: '有中文', acc: '免費' }
    ]}
  ]
}

];

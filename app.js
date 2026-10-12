/* ============================================================
   СЛОВА — монолитный app.js
   + Настройки, статистика, импорт, автоперевод, undo
   + Центрированные шторки и диалоги
   + Импорт с транскрипцией (word | translation | [transcription])
   + Китайский, японский, корейский — SCHEMA_VERSION = 13
   + Избранное (кнопка в разделе «Учить», поиск в режиме выбора)
   + Кнопки «Показать ответ» и «Озвучить» во всех режимах
   ============================================================ */
(function () {
  "use strict";

  const $ = id => document.getElementById(id);

  /* ============================================================
     ДАННЫЕ ПО УМОЛЧАНИЮ
     ============================================================ */
  function mkWord(word, transcription, translation, type) {
    return {
      word, transcription: transcription || "", translation,
      altTranslations: [], type: type || "noun",
      example: "", exampleTranslation: "",
      tags: [], notes: "", synonyms: [], antonyms: [],
      isFavorite: false,
      srs: { box: 0, due: 0, reps: 0, lapses: 0 }
    };
  }

  const raw = {
    en:["Английский",[
      ["hello","[həˈloʊ]","привет","phrase"],
      ["thank you","[ˈθæŋk juː]","спасибо","phrase"],
      ["yes","[jes]","да","adverb"],
      ["no","[noʊ]","нет","adverb"],
      ["water","[ˈwɔːtər]","вода","noun"],
      ["bread","[bred]","хлеб","noun"],
      ["friend","[frend]","друг","noun"],
      ["to read","[tuː riːd]","читать","verb"]
    ]],
    de:["Немецкий",[
      ["hallo","[ˈhalo]","привет","phrase"],
      ["danke","[ˈdaŋkə]","спасибо","phrase"],
      ["ja","[jaː]","да","adverb"],
      ["nein","[naɪn]","нет","adverb"],
      ["Wasser","[ˈvasɐ]","вода","noun"],
      ["Brot","[bʁoːt]","хлеб","noun"],
      ["Freund","[fʁɔɪ̯nt]","друг","noun"],
      ["lesen","[ˈleːzn̩]","читать","verb"]
    ]],
    fr:["Французский",[
      ["bonjour","[bɔ̃ʒuʁ]","привет","phrase"],
      ["merci","[mɛʁsi]","спасибо","phrase"],
      ["oui","[wi]","да","adverb"],
      ["non","[nɔ̃]","нет","adverb"],
      ["eau","[o]","вода","noun"],
      ["pain","[pɛ̃]","хлеб","noun"],
      ["ami","[ami]","друг","noun"],
      ["lire","[liʁ]","читать","verb"]
    ]],
    it:["Итальянский",[
      ["ciao","[ˈtʃao]","привет","phrase"],
      ["grazie","[ˈɡrattsje]","спасибо","phrase"],
      ["sì","[si]","да","adverb"],
      ["no","[nɔ]","нет","adverb"],
      ["acqua","[ˈakkwa]","вода","noun"],
      ["pane","[ˈpane]","хлеб","noun"],
      ["amico","[aˈmiko]","друг","noun"],
      ["leggere","[ˈlɛddʒere]","читать","verb"]
    ]],
    es:["Испанский",[
      ["hola","[ˈola]","привет","phrase"],
      ["gracias","[ˈɡɾaθjas]","спасибо","phrase"],
      ["sí","[si]","да","adverb"],
      ["no","[no]","нет","adverb"],
      ["agua","[ˈaɣwa]","вода","noun"],
      ["pan","[pan]","хлеб","noun"],
      ["amigo","[aˈmiɣo]","друг","noun"],
      ["leer","[leˈeɾ]","читать","verb"]
    ]],
    pt:["Португальский",[
      ["olá","[oˈla]","привет","phrase"],
      ["obrigado","[obɾiˈɡadu]","спасибо","phrase"],
      ["sim","[sĩ]","да","adverb"],
      ["não","[nɐ̃w̃]","нет","adverb"],
      ["água","[ˈaɡwɐ]","вода","noun"],
      ["pão","[pɐ̃w̃]","хлеб","noun"],
      ["amigo","[aˈmiɡu]","друг","noun"],
      ["ler","[leɾ]","читать","verb"]
    ]],
    tr:["Турецкий",[
      ["merhaba","[ˈmeɾhaba]","привет","phrase"],
      ["teşekkürler","[teʃecːyɾˈleɾ]","спасибо","phrase"],
      ["evet","[eˈvet]","да","adverb"],
      ["hayır","[haˈjɯɾ]","нет","adverb"],
      ["su","[su]","вода","noun"],
      ["ekmek","[ecˈmec]","хлеб","noun"],
      ["arkadaş","[aɾkaˈdaʃ]","друг","noun"],
      ["okumak","[okuˈmak]","читать","verb"]
    ]],
    mk:["Македонский",[
      ["здраво","[ˈzdravɔ]","привет","phrase"],
      ["благодарам","[bɫaɡɔˈdaɾam]","спасибо","phrase"],
      ["да","[da]","да","adverb"],
      ["не","[nɛ]","нет","adverb"],
      ["вода","[ˈvɔda]","вода","noun"],
      ["леб","[ɫɛb]","хлеб","noun"],
      ["пријател","[ˈprijatɛɫ]","друг","noun"],
      ["чита","[ˈt͡ʃita]","читать","verb"]
    ]],
    el:["Греческий",[
      ["γεια","[ʝa]","привет","phrase"],
      ["ευχαριστώ","[efxariˈsto]","спасибо","phrase"],
      ["ναι","[nɛ]","да","adverb"],
      ["όχι","[ˈoçi]","нет","adverb"],
      ["νερό","[neˈro]","вода","noun"],
      ["ψωμί","[psoˈmi]","хлеб","noun"],
      ["φίλος","[ˈfilos]","друг","noun"],
      ["διαβάζω","[ðʝaˈvazo]","читать","verb"]
    ]],
    sr:["Сербский",[
      ["здраво","[zdrâʋɔ]","привет","phrase"],
      ["хвала","[xʋǎːla]","спасибо","phrase"],
      ["да","[da]","да","adverb"],
      ["не","[nɛ]","нет","adverb"],
      ["вода","[ʋɔ̌da]","вода","noun"],
      ["хлеб","[xlɛ̂b]","хлеб","noun"],
      ["пријатељ","[prǐjaːteʎ]","друг","noun"],
      ["читати","[t͡ʃǐtati]","читать","verb"]
    ]],
    sv:["Шведский",[
      ["hej","[hɛj]","привет","phrase"],
      ["tack","[tak]","спасибо","phrase"],
      ["ja","[jɑː]","да","adverb"],
      ["nej","[nɛj]","нет","adverb"],
      ["vatten","[ˈvatːɛn]","вода","noun"],
      ["bröd","[brøːd]","хлеб","noun"],
      ["vän","[vɛn]","друг","noun"],
      ["läsa","[ˈlɛːsa]","читать","verb"]
    ]],
    no:["Норвежский",[
      ["hei","[hæi]","привет","phrase"],
      ["takk","[tak]","спасибо","phrase"],
      ["ja","[jɑː]","да","adverb"],
      ["nei","[næi]","нет","adverb"],
      ["vann","[van]","вода","noun"],
      ["brød","[brøː]","хлеб","noun"],
      ["venn","[vɛn]","друг","noun"],
      ["lese","[ˈleːsə]","читать","verb"]
    ]],
    da:["Датский",[
      ["hej","[hɑj]","привет","phrase"],
      ["tak","[tɑk]","спасибо","phrase"],
      ["ja","[jæ]","да","adverb"],
      ["nej","[nɑj]","нет","adverb"],
      ["vand","[van]","вода","noun"],
      ["brød","[bʁøð]","хлеб","noun"],
      ["ven","[vɛn]","друг","noun"],
      ["læse","[ˈlɛːsə]","читать","verb"]
    ]],
    fi:["Финский",[
      ["hei","[hei]","привет","phrase"],
      ["kiitos","[ˈkiːtos]","спасибо","phrase"],
      ["kyllä","[ˈkylːæ]","да","adverb"],
      ["ei","[ei]","нет","adverb"],
      ["vesi","[ˈvesi]","вода","noun"],
      ["leipä","[ˈleipæ]","хлеб","noun"],
      ["ystävä","[ˈystævæ]","друг","noun"],
      ["lukea","[ˈlukea]","читать","verb"]
    ]],
    zh:["Китайский",[
      ["你好","[nǐ hǎo]","привет","phrase"],
      ["谢谢","[xiè xie]","спасибо","phrase"],
      ["是","[shì]","да","adverb"],
      ["不","[bù]","нет","adverb"],
      ["水","[shuǐ]","вода","noun"],
      ["面包","[miàn bāo]","хлеб","noun"],
      ["朋友","[péng yǒu]","друг","noun"],
      ["读","[dú]","читать","verb"]
    ]],
    ja:["Японский",[
      ["こんにちは","[konnichiwa]","привет","phrase"],
      ["ありがとう","[arigatō]","спасибо","phrase"],
      ["はい","[hai]","да","adverb"],
      ["いいえ","[iie]","нет","adverb"],
      ["水","[mizu]","вода","noun"],
      ["パン","[pan]","хлеб","noun"],
      ["友達","[tomodachi]","друг","noun"],
      ["読む","[yomu]","читать","verb"]
    ]],
    ko:["Корейский",[
      ["안녕하세요","[annyeonghaseyo]","привет","phrase"],
      ["감사합니다","[gamsahamnida]","спасибо","phrase"],
      ["네","[ne]","да","adverb"],
      ["아니요","[aniyo]","нет","adverb"],
      ["물","[mul]","вода","noun"],
      ["빵","[ppang]","хлеб","noun"],
      ["친구","[chingu]","друг","noun"],
      ["읽다","[ikda]","читать","verb"]
    ]],
    ar:["Арабский",[
      ["مرحبا","[marhaban]","привет","phrase"],
      ["شكرا","[shukran]","спасибо","phrase"],
      ["نعم","[na'am]","да","adverb"],
      ["لا","[la]","нет","adverb"],
      ["ماء","[ma']","вода","noun"],
      ["خبز","[khubz]","хлеб","noun"],
      ["صديق","[sadiq]","друг","noun"],
      ["قرأ","[qara'a]","читать","verb"]
    ]],
    hi:["Хинди",[
      ["नमस्ते","[namaste]","привет","phrase"],
      ["धन्यवाद","[dhanyavaad]","спасибо","phrase"],
      ["हाँ","[haan]","да","adverb"],
      ["नहीं","[nahin]","нет","adverb"],
      ["पानी","[paani]","вода","noun"],
      ["रोटी","[roti]","хлеб","noun"],
      ["दोस्त","[dost]","друг","noun"],
      ["पढ़ना","[padhna]","читать","verb"]
    ]]
  };

  const DEFAULT_DATA = (() => {
    const out = {};
    for (const c of Object.keys(raw)) {
      const [name, rows] = raw[c];
      out[c] = {
        name,
        sections: { a1: { name: "A1", words: rows.map(r => mkWord(...r)) } }
      };
    }
    return out;
  })();

  const TYPE_OPTIONS = [
    { value:"noun", label:"существительное" },
    { value:"verb", label:"глагол" },
    { value:"adjective", label:"прилагательное" },
    { value:"adverb", label:"наречие" },
    { value:"pronoun", label:"местоимение" },
    { value:"preposition", label:"предлог" },
    { value:"conjunction", label:"союз" },
    { value:"phrase", label:"фраза" },
    { value:"other", label:"другое" }
  ];

  const MODE_OPTIONS = [
    { value:"learn",           label:"Карточки",         short:"Карточки", icon:"ri-flashlight-line" },
    { value:"type-en",         label:"Перевод → слово",  short:"→ слово",  icon:"ri-arrow-right-line" },
    { value:"type-ru",         label:"Слово → перевод",  short:"← перевод",icon:"ri-arrow-left-line" },
    { value:"choice",          label:"Выбор перевода",   short:"Выбор",    icon:"ri-checkbox-multiple-line" },
    { value:"gaps",            label:"Пропуски",         short:"Пропуски", icon:"ri-draggable" },
    { value:"dictate",         label:"Диктант",          short:"Диктант",  icon:"ri-volume-up-line" },
    { value:"dictate-reverse", label:"Обратный диктант", short:"Обратный", icon:"ri-translate-2" }
  ];

  const LANG_VOICES = {
    en:"en-US", fr:"fr-FR", de:"de-DE", es:"es-ES", it:"it-IT",
    pt:"pt-PT", ru:"ru-RU", uk:"uk-UA", pl:"pl-PL", cs:"cs-CZ",
    nl:"nl-NL", sv:"sv-SE", no:"nb-NO", nb:"nb-NO", nn:"nn-NO",
    da:"da-DK", fi:"fi-FI", is:"is-IS",
    tr:"tr-TR", mk:"mk-MK", el:"el-GR", sr:"sr-RS",
    ar:"ar-SA", he:"he-IL", fa:"fa-IR", hi:"hi-IN",
    bn:"bn-IN", zh:"zh-CN", ja:"ja-JP", ko:"ko-KR", th:"th-TH",
    vi:"vi-VN", hu:"hu-HU", ro:"ro-RO", bg:"bg-BG",
    hr:"hr-HR", sk:"sk-SK", sl:"sl-SI", lt:"lt-LT", lv:"lv-LV",
    et:"et-EE", id:"id-ID", ms:"ms-MY", tl:"fil-PH", sw:"sw-KE",
    ka:"ka-GE", hy:"hy-AM", az:"az-AZ", kk:"kk-KZ", uz:"uz-UZ"
  };
  const POPULAR_LANGS_HINT =
    "Код языка ISO 639-1: en, fr, de, es, it, pt, ru, pl, nl, " +
    "sv, no, da, fi, tr, mk, el, sr, ar, zh, ja, ko, hi...";
  const voiceLangFor = c => !c ? "en-US"
    : (LANG_VOICES[String(c).toLowerCase()] || "en-US");

  /* ============================================================
     СОСТОЯНИЕ
     ============================================================ */
  const STORAGE_KEY    = "wordsData_v11";
  const LEGACY_KEYS    = ["wordsData_v10", "wordsData_v9"];
  const STATS_KEY      = "wordsStats_v1";
  const SETTINGS_KEY   = "wordsSettings_v1";
  const SCHEMA_VERSION = 13;
  const DAY_MS         = 864e5;
  const SHORT_DUE_MS   = 6e5;
  const SRS_INTERVALS  = [0, 1, 3, 7, 14, 30, 90];

  let data = null;
  let stats = { days: {}, streak: 0, longestStreak: 0, lastActiveDay: null };
  let settings = {
    hotkeys: {},
    theme: "system",
    fontSize: "medium",
    autoSpeak: false,
    fuzzy: true
  };
  let currentLang = null;
  let currentSection = null;
  let activeTab = "learn";
  let session = null;
  let editingWord = null;
  let editFromSession = false;
  let editFormType = "other";
  let orderMode = "list";
  let limit = 0;
  let learnMode = "learn";
  let selectMode = false;
  let favoritesView = false;
  let selectedWords = [];
  let addFormValues = {
    word:"", transcription:"", trans:"", altTrans:"",
    type:"noun", tags:"", example:"", exampleTrans:"",
    synonyms:"", antonyms:"", notes:""
  };
  let searchQuery = "";
  let massMode = false;
  let massSet = new Set();

  const undoStack = [];
  const UNDO_LIMIT = 20;

  function pushUndo(label, undoFn) {
    undoStack.push({ label, undoFn, time: Date.now() });
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }
  function doUndo() {
    const item = undoStack.pop();
    if (!item) { toast("Нечего отменять"); return; }
    try {
      item.undoFn();
      toast("Отменено: " + item.label, { type: "success" });
    } catch (e) {
      toast("Не удалось отменить", { type: "error" });
    }
  }

  /* ============================================================
     УТИЛИТЫ
     ============================================================ */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  const clone = o => JSON.parse(JSON.stringify(o));

  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }
  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
  function parseList(s, sep) {
    return String(s || "").split(sep || ";").map(x => x.trim()).filter(Boolean);
  }
  function todayKey(d) {
    const dt = d || new Date();
    return dt.getFullYear() + "-" +
      String(dt.getMonth() + 1).padStart(2, "0") + "-" +
      String(dt.getDate()).padStart(2, "0");
  }
  function levenshtein(a, b) {
    a = String(a || ""); b = String(b || "");
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  /* ============================================================
     ХРАНИЛИЩЕ
     ============================================================ */
  function normalizeWord(w) {
    if (!w || typeof w !== "object") return mkWord("", "", "");
    if (typeof w.word !== "string") w.word = "";
    if (typeof w.transcription !== "string") w.transcription = "";
    if (typeof w.translation !== "string") w.translation = "";
    if (!Array.isArray(w.altTranslations)) w.altTranslations = [];
    if (typeof w.example !== "string") w.example = "";
    if (typeof w.exampleTranslation !== "string") w.exampleTranslation = "";
    if (!w.type) w.type = "other";
    if (!Array.isArray(w.tags)) w.tags = [];
    if (typeof w.notes !== "string") w.notes = "";
    if (!Array.isArray(w.synonyms)) w.synonyms = [];
    if (!Array.isArray(w.antonyms)) w.antonyms = [];
    if (typeof w.isFavorite !== "boolean") w.isFavorite = false;
    if (w.known !== undefined) {
      if (!w.srs) {
        const k = Number(w.known) || 0;
        w.srs = { box: k > 0 ? 3 : 0, due: 0,
                  reps: k === 0 ? 0 : 1, lapses: k < 0 ? 1 : 0 };
      }
      delete w.known;
    }
    if (w.status && !w.srs) {
      w.srs = { box: w.status === "known" ? 3 : 0, due: 0,
                reps: w.status === "new" ? 0 : 1,
                lapses: w.status === "unknown" ? 1 : 0 };
      delete w.status;
    }
    if (!w.srs || typeof w.srs !== "object")
      w.srs = { box: 0, due: 0, reps: 0, lapses: 0 };
    return w;
  }

  function migrate(d) {
    if (!d || typeof d !== "object") return clone(DEFAULT_DATA);
    const src = (d.languages && typeof d.languages === "object") ? d.languages : d;
    const out = {};
    for (const code of Object.keys(src)) {
      if (code.startsWith("_")) continue;
      const lang = src[code] || {};
      const sections = {};
      const sSrc = lang.sections || lang.themes;
      if (sSrc && typeof sSrc === "object") {
        for (const sc of Object.keys(sSrc)) {
          const sec = sSrc[sc] || {};
          sections[sc] = {
            name: sec.name || sc,
            words: Array.isArray(sec.words) ? sec.words.map(normalizeWord) : []
          };
        }
      } else if (Array.isArray(lang.words)) {
        sections.a1 = { name: "A1", words: lang.words.map(normalizeWord) };
      }
      if (Object.keys(sections).length === 0)
        sections.a1 = { name: "A1", words: [] };
      out[code] = { name: lang.name || code, sections };
    }
    return Object.keys(out).length ? out : clone(DEFAULT_DATA);
  }

  function mergeDefaults(userData, savedVersion) {
    const out = userData;
    const knownVersion = Number(savedVersion) || 0;
    if (knownVersion < SCHEMA_VERSION) {
      for (const code of Object.keys(DEFAULT_DATA)) {
        if (!out[code]) out[code] = clone(DEFAULT_DATA[code]);
      }
    }
    return out;
  }

  function loadData() {
    let rawStr = null;
    try { rawStr = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!rawStr) {
      for (const k of LEGACY_KEYS) {
        try {
          const l = localStorage.getItem(k);
          if (l) { rawStr = l; break; }
        } catch (e) {}
      }
    }
    let parsed = null;
    if (rawStr) {
      try { parsed = JSON.parse(rawStr); } catch (e) { parsed = null; }
    }
    if (!parsed) return clone(DEFAULT_DATA);
    const migrated = migrate(parsed);
    return mergeDefaults(migrated, parsed && parsed._schemaVersion);
  }

  function saveData() {
    const payload = clone(data);
    payload._schemaVersion = SCHEMA_VERSION;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}

    const today = todayKey();
    const bk = "wordsBackup_" + today;
    try {
      if (!localStorage.getItem(bk)) {
        localStorage.setItem(bk, JSON.stringify(payload));
      }
    } catch (e) {}

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf("wordsBackup_") === 0) keys.push(k);
    }
    keys.sort().reverse().slice(7).forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  }

  function loadStats() {
    try {
      const r = localStorage.getItem(STATS_KEY);
      if (r) return JSON.parse(r);
    } catch (e) {}
    return { days: {}, streak: 0, longestStreak: 0, lastActiveDay: null };
  }
  function saveStats() {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {}
  }
  function loadSettings() {
    try {
      const r = localStorage.getItem(SETTINGS_KEY);
      if (r) {
        const parsed = JSON.parse(r);
        return Object.assign({
          hotkeys: {},
          theme: "system",
          fontSize: "medium",
          autoSpeak: false,
          fuzzy: true
        }, parsed);
      }
    } catch (e) {}
    return {
      hotkeys: {},
      theme: "system",
      fontSize: "medium",
      autoSpeak: false,
      fuzzy: true
    };
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ============================================================
     SRS
     ============================================================ */
  const ensureSrs = w => {
    if (!w.srs || typeof w.srs !== "object")
      w.srs = { box: 0, due: 0, reps: 0, lapses: 0 };
    return w.srs;
  };
  const statusOf = w => {
    const s = ensureSrs(w);
    if (s.reps === 0) return "new";
    return s.box >= 3 ? "known" : "unknown";
  };
  function applyAnswer(w, correct) {
    const s = ensureSrs(w);
    s.reps++;
    if (correct) {
      s.box = Math.min(SRS_INTERVALS.length - 1, s.box + 1);
      s.due = Date.now() + (SRS_INTERVALS[s.box] || 1) * DAY_MS;
    } else {
      if (s.box >= 1) s.lapses++;
      s.box = 0;
      s.due = Date.now() + SHORT_DUE_MS;
    }
  }
  const isDue = w => {
    const s = ensureSrs(w);
    return s.reps > 0 && s.due <= Date.now();
  };
  function humanInterval(s) {
    if (s.reps === 0) return "новое";
    if (s.due <= Date.now()) return "пора повторить";
    const d = Math.round((s.due - Date.now()) / DAY_MS);
    if (d <= 0) return "сегодня";
    if (d === 1) return "через 1 день";
    return "через " + d + " дн.";
  }
  function bumpActivity(kind) {
    const k = todayKey();
    if (!stats.days[k]) stats.days[k] = { learned: 0, reviewed: 0 };
    if (kind === "learned") stats.days[k].learned++;
    else stats.days[k].reviewed++;
    const y = todayKey(new Date(Date.now() - DAY_MS));
    if (stats.lastActiveDay !== k) {
      stats.streak = stats.lastActiveDay === y ? (stats.streak || 0) + 1 : 1;
      if (stats.streak > (stats.longestStreak || 0))
        stats.longestStreak = stats.streak;
      stats.lastActiveDay = k;
    }
    saveStats();
  }

  /* ============================================================
     ОЗВУЧКА
     ============================================================ */
  const speechState = { voices: [], loaded: false, chosen: {} };

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) {
      speechState.voices = v;
      speechState.loaded = true;
      speechState.chosen = {};
    }
  }
  function pickVoice(langCode) {
    if (!langCode) return null;
    if (!speechState.loaded) loadVoices();
    if (!speechState.voices.length) return null;
    const target = langCode.toLowerCase();
    const base = target.split("-")[0];
    if (speechState.chosen[target] !== undefined) return speechState.chosen[target];
    let best = speechState.voices.find(v => (v.lang || "").toLowerCase() === target)
      || speechState.voices.find(v => (v.lang || "").toLowerCase().split("-")[0] === base)
      || speechState.voices.find(v => (v.lang || "").toLowerCase().startsWith(base));
    if (best && best.localService === false) {
      const local = speechState.voices.find(v =>
        v.localService && (v.lang || "").toLowerCase().split("-")[0] === base);
      if (local) best = local;
    }
    speechState.chosen[target] = best || null;
    return speechState.chosen[target];
  }
  function speak(text, slow, langCode) {
    if (!("speechSynthesis" in window) || !text) return;
    try {
      const targetLang = voiceLangFor(langCode || currentLang);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = targetLang;
      u.rate = slow ? 0.6 : 0.95;
      const voice = pickVoice(targetLang);
      if (voice) u.voice = voice;
      window.speechSynthesis.cancel();
      setTimeout(() => window.speechSynthesis.speak(u), 30);
    } catch (e) {}
  }
  function speakWord(w, slow, full) {
    if (!w) return;
    const text = full ? w.word : String(w.word || "").replace(/^to\s+/i, "");
    speak(text, slow, currentLang);
  }
  function speakTranslation(w, slow) {
    if (!w || !w.translation) return;
    speak(w.translation, slow, "ru");
  }
  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  /* ============================================================
     ВНЕШНИЕ API
     ============================================================ */
  async function autoTranslate(text, from, to) {
    if (!text) return null;
    try {
      const url = "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=" + encodeURIComponent(from + "|" + to);
      const r = await fetch(url);
      if (!r.ok) return null;
      const d = await r.json();
      const t = d && d.responseData && d.responseData.translatedText;
      if (!t || t.toUpperCase() === text.toUpperCase()) return null;
      return t;
    } catch (e) { return null; }
  }
  async function autoTranscribe(word) {
    if (!word) return null;
    if (currentLang !== "en") return null;
    try {
      const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" +
        encodeURIComponent(word.trim().toLowerCase().replace(/^to\s+/i, ""));
      const r = await fetch(url);
      if (!r.ok) return null;
      const d = await r.json();
      if (!Array.isArray(d) || !d[0]) return null;
      const entry = d[0];
      const phonetic = entry.phonetic
        || (entry.phonetics || []).map(p => p.text).find(Boolean);
      return phonetic || null;
    } catch (e) { return null; }
  }

  /* ============================================================
     УНИВЕРСАЛЬНАЯ ШТОРКА (openSheet)
     ============================================================ */
  function openSheet(opts) {
    const { title, icon, items, currentValue, onPick, footer, contentHtml, onMount } = opts || {};
    const overlay = document.createElement("div");
    overlay.className = "sheet-overlay";
    const itemsHtml = items
      ? items.map(it => {
          const active = it.value === currentValue ? " is-active" : "";
          const count = (typeof it.count === "number")
            ? '<span class="sheet-item-count">' + it.count + '</span>' : "";
          const iconHtml = it.icon
            ? '<i class="' + it.icon + ' sheet-item-icon"></i>' : "";
          return '<button type="button" class="sheet-item' + active + '" ' +
            'data-value="' + esc(it.value) + '">' +
              iconHtml +
              '<span class="sheet-item-label">' + esc(it.label) + '</span>' +
              count +
              '<i class="ri-check-line sheet-item-check"></i>' +
            '</button>';
        }).join("")
      : (contentHtml || "");
    overlay.innerHTML =
      '<div class="sheet" role="dialog" aria-modal="true">' +
        '<div class="sheet-header">' +
          (icon ? '<i class="' + icon + '"></i>' : "") +
          '<h3>' + esc(title || "") + '</h3>' +
          '<button type="button" class="sheet-close" aria-label="Закрыть">' +
            '<i class="ri-close-line"></i>' +
          '</button>' +
        '</div>' +
        '<div class="sheet-body">' + itemsHtml + '</div>' +
        (footer ? '<div class="sheet-footer">' + footer + '</div>' : "") +
      '</div>';
    document.body.appendChild(overlay);
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      overlay.classList.add("closing");
      document.removeEventListener("keydown", keyHandler);
      setTimeout(() => overlay.remove(), 180);
    };
    const keyHandler = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", keyHandler);
    overlay.querySelector(".sheet-close").onclick = close;
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    if (items) {
      overlay.querySelectorAll(".sheet-item").forEach(item => {
        item.addEventListener("click", () => {
          const v = item.dataset.value;
          close();
          if (v !== currentValue && onPick) onPick(v);
        });
      });
    }
    if (onMount) onMount(overlay, close);
    return { overlay, close };
  }

  /* ============================================================
     ДИАЛОГ ВЫБОРА ТИПА
     ============================================================ */
  function openTypeDialog(currentValue, onPick) {
    const dlg = $("typeDialog");
    if (!dlg) return;
    const list = dlg.querySelector("[data-type-list]");
    if (!list) return;
    list.innerHTML = TYPE_OPTIONS.map(o => {
      const active = o.value === currentValue ? " is-active" : "";
      return '<button type="button" class="sheet-item' + active + '" ' +
        'data-value="' + o.value + '">' +
          '<span class="sheet-item-label">' + esc(o.label) + '</span>' +
          '<i class="ri-check-line sheet-item-check"></i>' +
        '</button>';
    }).join("");
    list.querySelectorAll("[data-value]").forEach(btn => {
      btn.onclick = () => {
        const v = btn.dataset.value;
        if (dlg.open) dlg.close();
        if (onPick) onPick(v);
      };
    });
    if (!dlg.open) { try { dlg.showModal(); } catch (e) {} }
  }

  /* ============================================================
     КАСТОМНЫЙ СЕЛЕКТ
     ============================================================ */
  function renderCustomSelect(rootId, items, currentValue, onPick, defaultIcon) {
    const root = $(rootId);
    if (!root) return;
    const trigger = root.querySelector(".custom-select-trigger");
    const labelEl = trigger.querySelector(".custom-select-label");
    const iconEl  = trigger.querySelector(".custom-select-icon");
    if (!items.length) {
      labelEl.textContent = "Нет данных";
      labelEl.classList.add("placeholder");
      if (iconEl) iconEl.className = "custom-select-icon " + (defaultIcon || "ri-inbox-line");
      trigger.disabled = true;
      return;
    }
    trigger.disabled = false;
    const current = items.find(it => it.value === currentValue) || items[0];
    labelEl.textContent = current.label;
    labelEl.classList.remove("placeholder");
    if (iconEl && current.icon)
      iconEl.className = "custom-select-icon " + current.icon;
    trigger.onclick = e => {
      e.stopPropagation();
      openSheet({
        title: rootId === "langSel" ? "Язык" : "Раздел",
        icon: defaultIcon,
        items,
        currentValue: current.value,
        onPick
      });
    };
  }

  /* ============================================================
     ХЛЕБНАЯ КРОШКА
     ============================================================ */
  function updateBreadcrumb() {
    const el = $("breadcrumb");
    if (!el) return;
    const lang = currentLangObj();
    if (!lang) {
      el.innerHTML = '<i class="ri-emotion-sad-line"></i> нет языков';
      return;
    }
    const sec = currentSectionObj();
    const parts = ['<i class="ri-global-line"></i>' + esc(lang.name)];
    if (sec) {
      const total = sec.words.length;
      const known = sec.words.filter(w => statusOf(w) === "known").length;
      parts.push('<i class="ri-folder-line"></i>' + esc(sec.name));
      parts.push('<i class="ri-file-list-3-line"></i>' + known + '/' + total);
    } else {
      parts.push('<i class="ri-emotion-normal-line"></i> нет раздела');
    }
    el.innerHTML = parts.join('<span class="sep">·</span>');
  }

  /* ============================================================
     ХЕЛПЕРЫ ДАННЫХ
     ============================================================ */
  const currentLangObj = () =>
    currentLang && data[currentLang] ? data[currentLang] : null;
  const currentSectionObj = () => {
    const l = currentLangObj();
    return (l && currentSection && l.sections[currentSection]) || null;
  };
  const currentWords = () => {
    const s = currentSectionObj();
    return s ? s.words : [];
  };
  function allTranslationsOf(w) {
    const o = [];
    if (w.translation) o.push(w.translation);
    (w.altTranslations || []).forEach(t => t && o.push(t));
    return o;
  }
  const normalizeForCompare = s =>
    String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  function checkTyped(input, w, field) {
    const a = normalizeForCompare(input);
    if (!w) return { ok: false, near: false };
    const variants = field === "translation"
      ? allTranslationsOf(w).map(normalizeForCompare)
      : [normalizeForCompare(w.word)];
    if (variants.includes(a)) return { ok: true, near: false };
    if (settings.fuzzy && a.length > 2) {
      for (const v of variants) {
        if (Math.abs(v.length - a.length) > 1) continue;
        if (levenshtein(a, v) === 1) return { ok: false, near: true };
      }
    }
    return { ok: false, near: false };
  }
  function filterWords(list) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(w =>
      (w.word || "").toLowerCase().includes(q) ||
      (w.translation || "").toLowerCase().includes(q) ||
      (w.transcription || "").toLowerCase().includes(q) ||
      (w.altTranslations || []).some(t => t.toLowerCase().includes(q)) ||
      (w.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (w.notes || "").toLowerCase().includes(q)
    );
  }
  function applyOrder(arr) {
    if (orderMode === "random") return shuffle(arr);
    if (orderMode === "alpha") return arr.slice().sort((a, b) =>
      a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
    return arr.slice();
  }
  function applyLimit(arr) {
    return (limit > 0 && arr.length > limit) ? arr.slice(0, limit) : arr;
  }

  /* ============================================================
     ПРОПУСКИ
     ============================================================ */
  function makeGaps(word) {
    const chars = Array.from(word);
    const idx = [];
    chars.forEach((c, i) => { if (/[\p{L}\p{N}]/u.test(c)) idx.push(i); });
    if (idx.length < 2) return word;
    const count = Math.max(1, Math.round(idx.length / 3));
    const set = new Set(shuffle(idx).slice(0, count));
    return chars.map((c, i) => set.has(i) ? "_" : c).join("");
  }

  /* ============================================================
     ТОСТЫ И ДИАЛОГИ
     ============================================================ */
  function toast(msg, opts) {
    opts = opts || {};
    const type = opts.type || "default";
    const action = opts.action;
    const label = opts.actionLabel || "Отменить";
    const timeout = opts.timeout || (action ? 5000 : 2800);
    const root = $("toasts");
    if (!root) return;
    const iconMap = {
      success: "ri-checkbox-circle-line",
      error:   "ri-error-warning-line",
      default: "ri-information-line"
    };
    const el = document.createElement("div");
    el.className = "toast" + (type !== "default" ? " toast-" + type : "");
    el.innerHTML = '<i class="' + (iconMap[type] || iconMap.default) + '"></i>' +
      "<span>" + esc(msg) + "</span>";
    let timer;
    const dismiss = () => {
      clearTimeout(timer);
      el.classList.add("toast-out");
      setTimeout(() => el.remove(), 180);
    };
    if (action) {
      const b = document.createElement("button");
      b.className = "toast-action";
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        try { action(); } catch (e) {}
        dismiss();
      });
      el.appendChild(b);
    }
    root.appendChild(el);
    timer = setTimeout(dismiss, timeout);
  }

  function askText(title, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const dlg = $("promptDialog") || null;
      if (!dlg) { resolve(null); return; }
      $("promptTitle").textContent = title;
      const msg = $("promptMessage");
      if (opts.message) { msg.textContent = opts.message; msg.hidden = false; }
      else { msg.textContent = ""; msg.hidden = true; }
      const inp = $("promptInput");
      inp.placeholder = opts.placeholder || "";
      inp.value = opts.value || "";
      const ok = $("promptOk"), cancel = $("promptCancel");
      const done = v => {
        ok.onclick = cancel.onclick = inp.onkeydown = null;
        dlg.close(); resolve(v);
      };
      ok.onclick = e => { e.preventDefault(); done(inp.value.trim() || null); };
      cancel.onclick = e => { e.preventDefault(); done(null); };
      inp.onkeydown = e => {
        if (e.key === "Enter") { e.preventDefault(); ok.click(); }
        else if (e.key === "Escape") { e.preventDefault(); cancel.click(); }
      };
      dlg.showModal();
      setTimeout(() => inp.focus(), 20);
    });
  }
  function askConfirm(title, opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const dlg = $("confirmDialog") || null;
      if (!dlg) { resolve(true); return; }
      $("confirmTitle").textContent = title;
      $("confirmMessage").textContent = opts.message || "";
      const ok = $("confirmOk"), cancel = $("confirmCancel");
      ok.textContent = opts.confirmLabel || "OK";
      ok.classList.toggle("danger", !!opts.danger);
      const done = v => {
        ok.onclick = cancel.onclick = null;
        dlg.close(); resolve(v);
      };
      ok.onclick = e => { e.preventDefault(); done(true); };
      cancel.onclick = e => { e.preventDefault(); done(false); };
      dlg.addEventListener("cancel", () => done(false), { once: true });
      dlg.showModal();
      setTimeout(() => ok.focus(), 20);
    });
  }

  /* ============================================================
     ТЕМА И НАСТРОЙКИ ВНЕШНЕГО ВИДА
     ============================================================ */
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyTheme(t) {
    let actual = t;
    if (t === "system") actual = systemPrefersDark() ? "dark" : "light";
    document.documentElement.dataset.theme = actual;
    localStorage.setItem("theme", actual);
    const btn = $("themeToggle");
    if (btn) btn.innerHTML = actual === "dark"
      ? '<i class="ri-sun-line"></i>'
      : '<i class="ri-moon-line"></i>';
  }
  function applyFontSize(size) {
    const sizes = { small: "14px", medium: "16px", large: "18px" };
    document.documentElement.style.fontSize = sizes[size] || sizes.medium;
  }
  function applyAllSettings() {
    applyTheme(settings.theme || "system");
    applyFontSize(settings.fontSize || "medium");
    updateSettingsUI();
  }
  function updateSettingsUI() {
    document.querySelectorAll("#setTheme [data-theme-val]").forEach(b => {
      b.classList.toggle("active", b.dataset.themeVal === (settings.theme || "system"));
    });
    document.querySelectorAll("#setFontSize [data-fs]").forEach(b => {
      b.classList.toggle("active", b.dataset.fs === (settings.fontSize || "medium"));
    });
    const autoSpeak = $("setAutoSpeak");
    if (autoSpeak) autoSpeak.setAttribute("aria-checked", settings.autoSpeak ? "true" : "false");
    const fuzzy = $("setFuzzy");
    if (fuzzy) fuzzy.setAttribute("aria-checked", settings.fuzzy ? "true" : "false");
    renderHotkeysList();
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (settings.theme === "system") applyTheme("system");
    });
  }

  /* ============================================================
     ГОРЯЧИЕ КЛАВИШИ
     ============================================================ */
  const HOTKEYS = [
    { id:"reveal",  label:"Показать ответ",  def:"Space" },
    { id:"know",    label:"Проверено",       def:"1" },
    { id:"unknown", label:"Не знаю",         def:"2" },
    { id:"search",  label:"Фокус в поиск",   def:"/" },
    { id:"edit",    label:"Редактировать",   def:"E" },
    { id:"speak",   label:"Озвучить",        def:"S" },
    { id:"skip",    label:"Пропустить",      def:"ArrowRight" },
    { id:"back",    label:"Назад",           def:"ArrowLeft" },
    { id:"undo",    label:"Отменить",        def:"Ctrl+Z" }
  ];
  const getHotkey = id => {
    const a = HOTKEYS.find(x => x.id === id);
    return (settings.hotkeys && settings.hotkeys[id]) || (a ? a.def : null);
  };
  function renderHotkeysList() {
    const root = $("hotkeysList");
    if (!root) return;
    root.innerHTML = HOTKEYS.map(a =>
      '<div class="hotkey-row">' +
        '<span class="hotkey-label">' + esc(a.label) + '</span>' +
        '<input type="text" class="hotkey-input" data-hk="' + a.id + '" ' +
          'value="' + esc(getHotkey(a.id)) + '" readonly>' +
      '</div>').join("");
    root.querySelectorAll(".hotkey-input").forEach(inp => {
      inp.addEventListener("click", () => {
        inp.classList.add("recording");
        inp.value = "…";
        const h = e => {
          e.preventDefault();
          if (e.key === "Escape") {
            inp.value = getHotkey(inp.dataset.hk);
            inp.classList.remove("recording");
            document.removeEventListener("keydown", h, true);
            return;
          }
          if (["Shift","Control","Alt","Meta"].includes(e.key)) return;
          const combo = (e.ctrlKey ? "Ctrl+" : "") +
                        (e.altKey ? "Alt+" : "") +
                        (e.shiftKey && e.key.length > 1 ? "Shift+" : "") +
                        (e.key === " " ? "Space" : e.key);
          settings.hotkeys[inp.dataset.hk] = combo;
          saveSettings();
          inp.value = combo;
          inp.classList.remove("recording");
          document.removeEventListener("keydown", h, true);
          toast("Клавиша сохранена", { type: "success" });
        };
        document.addEventListener("keydown", h, true);
      });
    });
  }
  function matchHotkey(e, key) {
    if (!key) return false;
    const parts = key.split("+");
    const main = parts[parts.length - 1];
    const nCtrl = parts.includes("Ctrl");
    const nAlt = parts.includes("Alt");
    const nShift = parts.includes("Shift");
    if (nCtrl !== e.ctrlKey || nAlt !== e.altKey || nShift !== e.shiftKey) return false;
    const norm = k => k === " " ? "Space" : k;
    return norm(e.key) === main || norm(e.code) === main;
  }

  /* ============================================================
     СВАЙПЫ
     ============================================================ */
  function attachSwipe(el, handlers) {
    if (!el || !handlers) return;
    let sx = 0, sy = 0, dx = 0, dy = 0, active = false, pid = null;
    const TH = 90;
    el.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse") return;
      if (e.target.closest("button, input, textarea, a")) return;
      active = true; pid = e.pointerId;
      sx = e.clientX; sy = e.clientY;
      el.style.transition = "none";
      try { el.setPointerCapture(pid); } catch (_) {}
    });
    el.addEventListener("pointermove", e => {
      if (!active || e.pointerId !== pid) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (Math.abs(dy) > Math.abs(dx) * 1.5) return;
      el.style.transform = "translate(" + dx + "px, " + dy * 0.15 + "px) rotate(" + dx * 0.04 + "deg)";
      el.style.opacity = String(Math.max(0.4, 1 - Math.abs(dx) / 400));
    });
    const end = e => {
      if (!active || e.pointerId !== pid) return;
      active = false;
      el.style.transition = ""; el.style.transform = ""; el.style.opacity = "";
      if (dx > TH && handlers.onRight) handlers.onRight();
      else if (dx < -TH && handlers.onLeft) handlers.onLeft();
      dx = dy = 0;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  /* ============================================================
     REORDER
     ============================================================ */
  function makeSortable(list, onDrop) {
    let dragEl = null;
    Array.from(list.children).forEach(el => {
      el.addEventListener("dragstart", e => {
        dragEl = el; el.classList.add("dragging");
        try { e.dataTransfer.setData("text/plain", ""); } catch (_) {}
      });
      el.addEventListener("dragend", () => {
        el.classList.remove("dragging"); dragEl = null;
        Array.from(list.children).forEach(c => c.classList.remove("drag-over"));
      });
      el.addEventListener("dragover", e => {
        e.preventDefault();
        if (!dragEl || dragEl === el) return;
        Array.from(list.children).forEach(c => c.classList.remove("drag-over"));
        el.classList.add("drag-over");
        const r = el.getBoundingClientRect();
        el.dataset.before = (e.clientY - r.top) < r.height / 2 ? "1" : "0";
      });
      el.addEventListener("drop", e => {
        e.preventDefault();
        if (!dragEl || dragEl === el) return;
        const before = el.dataset.before === "1";
        if (before) list.insertBefore(dragEl, el);
        else list.insertBefore(dragEl, el.nextSibling);
        if (onDrop) onDrop();
      });
    });
  }
  function openReorderSections() {
    const lang = currentLangObj();
    if (!lang) return;
    const codes = Object.keys(lang.sections);
    const contentHtml = '<div id="rList">' +
      codes.map(c =>
        '<div class="reorder-item" draggable="true" data-code="' + c + '">' +
          '<span class="reorder-grip"><i class="ri-drag-move-2-line"></i></span>' +
          '<span>' + esc(lang.sections[c].name) + '</span>' +
          '<span class="reorder-trans">' + lang.sections[c].words.length + ' сл.</span>' +
        '</div>').join("") +
    '</div>';
    const footerHtml =
      '<button type="button" class="btn" data-rc>Отмена</button>' +
      '<button type="button" class="btn primary" data-rs>Сохранить</button>';
    openSheet({
      title: "Порядок разделов",
      icon: "ri-drag-move-2-line",
      contentHtml,
      footer: footerHtml,
      onMount: (ov, close) => {
        const list = ov.querySelector("#rList");
        makeSortable(list, null);
        ov.querySelector("[data-rc]").onclick = close;
        ov.querySelector("[data-rs]").onclick = () => {
          const order = Array.from(list.children).map(el => el.dataset.code);
          const reordered = {};
          order.forEach(c => { reordered[c] = lang.sections[c]; });
          lang.sections = reordered;
          close();
          saveData();
          renderSectionSelect();
          switchTab(activeTab);
          toast("Порядок сохранён", { type: "success" });
        };
      }
    });
  }

  /* ============================================================
     РЕНДЕР СТРОКИ СПИСКА
     ============================================================ */
  function renderWordRow(w, opts) {
    opts = opts || {};
    const idx = opts.idx;
    const editAttr = opts.editAttr || "data-edit";
    const delAttr = opts.delAttr || "data-delete-new";
    const resetAttr = opts.resetAttr || "data-reset";
    const markAttr = opts.markAttr || "data-mark";
    const isSel = massMode && massSet.has(w);
    const tr = w.transcription
      ? '<div class="list-transcription">' + esc(w.transcription) + '</div>' : "";
    const alt = (w.altTranslations && w.altTranslations.length)
      ? '<div class="list-alt">также: ' + esc(w.altTranslations.join(", ")) + '</div>' : "";
    const notes = w.notes
      ? '<div class="list-notes">' + esc(w.notes) + '</div>' : "";
    const tags = (w.tags && w.tags.length)
      ? '<div class="list-tags">' + w.tags.map(t =>
          '<span class="list-tag">' + esc(t) + '</span>').join("") + '</div>' : "";
    const srs = opts.showSrs
      ? '<div class="list-srs">' + esc(humanInterval(ensureSrs(w))) + '</div>' : "";
    let ex = "";
    if (opts.showExample && (w.example || w.exampleTranslation)) {
      ex = '<div class="list-example">' +
        (w.example ? esc(w.example) : "") +
        (w.example && w.exampleTranslation ? " — " : "") +
        '<span class="ex-trans">' +
          (w.exampleTranslation ? esc(w.exampleTranslation) : "") +
        '</span></div>';
    }
    let a = "";
    if (opts.showMarkKnown) a +=
      '<button class="list-btn mark-known" type="button" ' + markAttr + '="known" ' +
      markAttr + '-idx="' + idx + '" aria-label="Проверено">' +
      '<i class="ri-check-line"></i></button>';
    if (opts.showMarkUnknown) a +=
      '<button class="list-btn mark-unknown" type="button" ' + markAttr + '="unknown" ' +
      markAttr + '-idx="' + idx + '" aria-label="На повтор">' +
      '<i class="ri-question-line"></i></button>';
    if (opts.showSpeak !== false) a +=
      '<button class="list-btn" type="button" data-speak="' + esc(w.word) + '" aria-label="Прослушать">' +
      '<i class="ri-volume-up-line"></i></button>';
    if (opts.showEdit !== false) a +=
      '<button class="list-btn" type="button" ' + editAttr + '="' + idx + '" aria-label="Редактировать">' +
      '<i class="ri-edit-line"></i></button>';
    if (opts.showUnfavorite) a +=
      '<button class="list-btn fav" type="button" data-unfavorite="' + idx +
        '" aria-label="Убрать из избранного"><i class="ri-star-fill"></i></button>';
    if (opts.showReset) a +=
      '<button class="list-btn danger" type="button" ' + resetAttr + '="' + idx + '" aria-label="В изучение">' +
      '<i class="ri-restart-line"></i></button>';
    if (opts.showDelete) a +=
      '<button class="list-btn danger" type="button" ' + delAttr + '="' + idx + '" aria-label="Удалить">' +
      '<i class="ri-close-line"></i></button>';
    return '<div class="list-row' + (isSel ? ' is-selected' : '') + '" data-idx="' + idx + '">' +
      '<input type="checkbox" class="mass-check" data-mass-check="' + idx + '"' +
        (isSel ? ' checked' : '') + ' aria-label="Выбрать">' +
      '<div class="list-main">' +
        '<div class="list-word">' + esc(w.word) + '</div>' + tr +
        '<div class="list-trans">' + esc(w.translation) + '</div>' +
        alt + tags + ex + notes + srs +
      '</div>' +
      '<div class="list-actions">' + a + '</div>' +
    '</div>';
  }

  /* ============================================================
     СПИСКИ
     ============================================================ */
  function buildNewWordsList() {
    const all = currentWords().filter(w => statusOf(w) === "new");
    const words = filterWords(all);
    if (all.length === 0) {
      return '<div class="words-list-title">Слова для изучения (0)</div>' +
        '<div class="list-empty">Новых слов нет</div>';
    }
    if (words.length === 0) {
      return '<div class="words-list-title">Слова для изучения (0 из ' + all.length + ')</div>' +
        '<div class="list-empty">Ничего не найдено</div>';
    }
    const t = searchQuery.trim()
      ? 'Найдено: ' + words.length + ' из ' + all.length
      : 'Слова для изучения (' + all.length + ')';
    return '<div class="words-list-title">' + t + '</div>' +
      words.map(w => renderWordRow(w, {
        idx: all.indexOf(w),
        showEdit: true, showDelete: true,
        editAttr: "data-edit-new", delAttr: "data-delete-new",
        showMarkKnown: true, showMarkUnknown: true,
        markAttr: "data-mark-new"
      })).join("");
  }
  function buildDueList() {
    const all = currentWords().filter(isDue);
    const words = filterWords(all);
    if (all.length === 0)
      return '<div class="list-empty">Сейчас нечего повторять</div>';
    if (words.length === 0)
      return '<div class="list-empty">Ничего не найдено</div>';
    const t = searchQuery.trim()
      ? 'Найдено: ' + words.length + ' из ' + all.length
      : 'Сейчас повторить (' + all.length + ')';
    return '<div class="words-list-title">' + t + '</div>' +
      words.map(w => renderWordRow(w, {
        idx: all.indexOf(w),
        showExample: true, showSrs: true, showEdit: true,
        showMarkKnown: true, showMarkUnknown: true,
        editAttr: "data-edit-due", markAttr: "data-mark-due",
        resetAttr: "data-reset-due"
      })).join("");
  }
  function buildStatusList(st) {
    const all = currentWords().filter(w => statusOf(w) === st);
    const words = filterWords(all);
    if (all.length === 0) {
      return '<div class="list-empty">' +
        (st === "known" ? 'Раздел «Проверено» пуст.' : 'Раздел «На повтор» пуст.') +
      '</div>';
    }
    if (words.length === 0)
      return '<div class="list-empty">Ничего не найдено</div>';
    const t = searchQuery.trim()
      ? 'Найдено: ' + words.length + ' из ' + all.length
      : (st === "known"
          ? 'Проверено (' + all.length + ')'
          : 'На повтор (' + all.length + ')');
    return '<div class="words-list-title">' + t + '</div>' +
      words.map(w => renderWordRow(w, {
        idx: all.indexOf(w),
        showExample: true, showSrs: true, showEdit: true,
        showMarkKnown: st === "unknown",
        showMarkUnknown: st === "known",
        showReset: true,
        editAttr: "data-edit", resetAttr: "data-reset",
        markAttr: "data-mark-status"
      })).join("");
  }
  function buildFavoritesList() {
    const all = currentWords().filter(w => w.isFavorite);
    const words = filterWords(all);
    if (all.length === 0) {
      return '<div class="list-empty">В избранном пока нет слов.<br>' +
        'Откройте «Выбрать вручную» и отметьте слова звёздочкой.</div>';
    }
    if (words.length === 0)
      return '<div class="list-empty">Ничего не найдено</div>';
    const t = searchQuery.trim()
      ? 'Найдено: ' + words.length + ' из ' + all.length
      : 'Избранное (' + all.length + ')';
    return '<div class="words-list-title">' + t + '</div>' +
      words.map(w => renderWordRow(w, {
        idx: all.indexOf(w),
        showExample: true, showSrs: true, showEdit: true,
        showUnfavorite: true,
        showReset: true,
        editAttr: "data-edit", resetAttr: "data-reset"
      })).join("");
  }
  function searchHtml() {
    return '<div class="search-box">' +
      '<i class="ri-search-line"></i>' +
      '<input type="text" class="search-input" placeholder="Поиск..." ' +
        'value="' + esc(searchQuery) + '" autocomplete="off" spellcheck="false">' +
      '<button type="button" class="search-clear" aria-label="Очистить" ' +
        (searchQuery ? '' : 'hidden') + '>' +
        '<i class="ri-close-line"></i></button></div>';
  }
  function renderList(viewId, status) {
    const el = $(viewId);
    if (!el) return;
    const body = status === "due" ? buildDueList() : buildStatusList(status);
    el.innerHTML = searchHtml() +
      '<div class="words-list-inner">' + body + '</div>';
    applyMassUI();
  }
  function currentWordsForTab(tab) {
    const words = currentWords();
    if (tab === "learn") return words.filter(w => statusOf(w) === "new");
    if (tab === "due") return words.filter(isDue);
    if (tab === "favorites") return words.filter(w => w.isFavorite);
    if (tab === "known") return words.filter(w => statusOf(w) === "known");
    if (tab === "unknown") return words.filter(w => statusOf(w) === "unknown");
    return words;
  }

  /* ============================================================
     СТАТИСТИКА (карточка на главном экране)
     ============================================================ */
  function statsCardHtml() {
    const words = currentWords();
    const total = words.length;
    const known = words.filter(w => statusOf(w) === "known").length;
    const due = words.filter(isDue).length;
    const streak = stats.streak || 0;
    const pct = total > 0 ? Math.round(known / total * 100) : 0;
    return '<div class="stats-card">' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-check-double-line"></i></span>' +
        '<span class="val">' + known + '/' + total + '</span>' +
        '<span class="lbl">Проверено</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-time-line"></i></span>' +
        '<span class="val">' + due + '</span>' +
        '<span class="lbl">Сейчас</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-fire-line"></i></span>' +
        '<span class="val">' + streak + '</span>' +
        '<span class="lbl">Дней подряд</span>' +
      '</div>' +
    '</div>' +
    '<div class="progress-bar"><div style="width:' + pct + '%"></div></div>';
  }

  /* ============================================================
     ВКЛАДКИ
     ============================================================ */
  function renderTabs() {
    const words = currentWords();
    $("cnt-learn").textContent = words.filter(w => statusOf(w) === "new").length;
    $("cnt-known").textContent = words.filter(w => statusOf(w) === "known").length;
    $("cnt-unknown").textContent = words.filter(w => statusOf(w) === "unknown").length;
    const dc = words.filter(isDue).length;
    const dueEl = $("cnt-due");
    dueEl.textContent = dc;
    dueEl.classList.toggle("is-positive", dc > 0);
    document.querySelectorAll(".tab").forEach(t =>
      t.classList.toggle("active", t.dataset.tab === activeTab));
    updateBreadcrumb();
  }
  function switchTab(tab) {
    if (["learn","due","known","unknown"].indexOf(tab) === -1) return;
    activeTab = tab;
    $("view-learn").hidden   = tab !== "learn";
    $("view-due").hidden     = tab !== "due";
    $("view-known").hidden   = tab !== "known";
    $("view-unknown").hidden = tab !== "unknown";
    if (tab !== "learn") { exitMass(); favoritesView = false; }
    renderTabs();
    if (tab === "learn")   renderLearn();
    if (tab === "due")     renderList("view-due", "due");
    if (tab === "known")   renderList("view-known", "known");
    if (tab === "unknown") renderList("view-unknown", "unknown");
    updateScrollBtns();
  }

  /* ============================================================
     ПАНЕЛИ
     ============================================================ */
  function orderBarHtml() {
    const cls = m => orderMode === m ? "active" : "";
    const opt = (v, icon, txt) =>
      '<button type="button" data-order="' + v + '" class="' + cls(v) + '">' +
        '<i class="' + icon + '"></i>' +
        '<span class="seg-text">' + txt + '</span></button>';
    return '<div class="order-bar">' +
      '<span class="order-label"><i class="ri-sort-desc"></i>Порядок</span>' +
      '<div class="seg">' +
        opt("list",   "ri-list-unordered",    "По списку") +
        opt("alpha",  "ri-sort-alphabet-asc", "Алфавит") +
        opt("random", "ri-shuffle-line",      "Вперемешку") +
      '</div></div>';
  }
  function limitBarHtml() {
    const cls = v => limit === v ? "active" : "";
    const num = (v, txt) =>
      '<button type="button" data-limit="' + v + '" class="' + cls(v) + '">' +
        '<i class="ri-hashtag"></i>' +
        '<span class="seg-text">' + txt + '</span></button>';
    return '<div class="order-bar">' +
      '<span class="order-label"><i class="ri-stack-line"></i>Слов за раз</span>' +
      '<div class="seg">' +
        num(5,  "5") +
        num(10, "10") +
        num(20, "20") +
        num(0,  "Все") +
      '</div></div>';
  }
  function modeBarHtml() {
    const cls = m => learnMode === m ? "active" : "";
    return '<div class="order-bar">' +
      '<span class="order-label"><i class="ri-equalizer-line"></i>Режим</span>' +
      '<div class="seg seg-grid">' +
        MODE_OPTIONS.map(o =>
          '<button type="button" data-mode="' + o.value + '" class="' + cls(o.value) + '" ' +
            'title="' + esc(o.label) + '" aria-label="' + esc(o.label) + '">' +
            '<i class="' + o.icon + '"></i>' +
            '<span class="seg-text">' + esc(o.short) + '</span>' +
          '</button>').join("") +
      '</div></div>';
  }

  /* ============================================================
     ФОРМА ДОБАВЛЕНИЯ
     ============================================================ */
  function addFormHtml() {
    const typeCur = TYPE_OPTIONS.find(o => o.value === addFormValues.type) || TYPE_OPTIONS[0];
    const lang = currentLangObj(), sec = currentSectionObj();
    const where = (lang && sec)
      ? "→ " + lang.name + " / " + sec.name
      : (lang ? "→ " + lang.name + " (нет раздела)" : "Сначала создайте язык");
    return '<div class="add-section">' +
      '<h2>Добавить слово</h2>' +
      '<div class="hint">' + esc(where) + '</div>' +
      '<div class="input-with-btn">' +
        '<input type="text" id="newWord" placeholder="Слово" value="' + esc(addFormValues.word) + '">' +
        '<button type="button" class="input-icon-btn" id="newWordTranslateBtn" title="Перевести">' +
          '<i class="ri-translate-2"></i>' +
        '</button>' +
      '</div>' +
      '<div class="input-with-btn">' +
        '<input type="text" id="newTranscription" placeholder="Транскрипция" value="' + esc(addFormValues.transcription) + '">' +
        '<button type="button" class="input-icon-btn" id="newWordTranscribeBtn" title="Транскрипция">' +
          '<i class="ri-mic-line"></i>' +
        '</button>' +
      '</div>' +
      '<input type="text" id="newTrans" placeholder="Перевод" value="' + esc(addFormValues.trans) + '">' +
      '<input type="text" id="newAltTrans" placeholder="Другие переводы через ;" value="' + esc(addFormValues.altTrans) + '">' +
      '<div class="custom-select" id="newType">' +
        '<button type="button" class="custom-select-trigger" aria-haspopup="listbox">' +
          '<i class="ri-price-tag-3-line custom-select-icon"></i>' +
          '<span class="custom-select-label">' + esc(typeCur.label) + '</span>' +
          '<i class="ri-arrow-down-s-line custom-select-arrow"></i>' +
        '</button>' +
      '</div>' +
      '<input type="text" id="newTags" placeholder="Теги через запятую" value="' + esc(addFormValues.tags) + '">' +
      '<input type="text" id="newExample" placeholder="Пример" value="' + esc(addFormValues.example) + '">' +
      '<input type="text" id="newExampleTrans" placeholder="Перевод примера" value="' + esc(addFormValues.exampleTrans) + '">' +
      '<input type="text" id="newSynonyms" placeholder="Синонимы через ;" value="' + esc(addFormValues.synonyms) + '">' +
      '<input type="text" id="newAntonyms" placeholder="Антонимы через ;" value="' + esc(addFormValues.antonyms) + '">' +
      '<textarea id="newNotes" rows="2" placeholder="Заметка">' + esc(addFormValues.notes) + '</textarea>' +
      '<div class="add-errors" id="addErrors" hidden></div>' +
      '<div class="row"><button id="addBtn" type="button" class="btn primary">Добавить</button></div>' +
    '</div>';
  }
  function showAddErrors(errors) {
    const el = $("addErrors");
    if (!el) return;
    if (!errors || errors.length === 0) { el.innerHTML = ""; el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = errors.map(e =>
      '<div class="add-error"><i class="ri-error-warning-line"></i>' + esc(e) + '</div>').join("");
  }
  function validateNewWord(w, t, existing) {
    const err = [];
    w = String(w || "").trim(); t = String(t || "").trim();
    if (!w) err.push("Слово не заполнено");
    else if (!/[\p{L}\p{N}]/u.test(w)) err.push("В слове должны быть буквы или цифры");
    if (!t) err.push("Перевод не заполнен");
    else if (!/[\p{L}]/u.test(t)) err.push("В переводе должны быть буквы");
    if (w && t && (existing || []).some(x =>
      (x.word || "").trim().toLowerCase() === w.toLowerCase()))
      err.push("Такое слово уже есть в этом разделе");
    return err;
  }
  function resetAddForm() {
    addFormValues = {
      word:"", transcription:"", trans:"", altTrans:"",
      type:"noun", tags:"", example:"", exampleTrans:"",
      synonyms:"", antonyms:"", notes:""
    };
  }

  /* ============================================================
     СЕССИЯ
     ============================================================ */
  function startSession(type, explicit) {
    let queue;
    if (explicit) queue = explicit.slice();
    else {
      const words = currentWords();
      if (type === "new") queue = words.filter(w => statusOf(w) === "new");
      else if (type === "unknown") queue = words.filter(w => statusOf(w) === "unknown");
      else if (type === "due") queue = words.filter(isDue);
      else if (type === "favorites") queue = words.filter(w => w.isFavorite);
      else queue = words.slice();
    }
    if (queue.length === 0) { session = null; renderLearn(); return; }
    queue = applyOrder(queue);
    if (!explicit) queue = applyLimit(queue);
    session = {
      queue, index: 0, knownCount: 0, unknownCount: 0,
      revealed: false, type,
      typedInput: "", typedChecked: false, typedCorrect: false, typedNear: false,
      gapsCache: "", _spokenFor: -1, choices: null, choicePicked: null,
      history: []
    };
    selectMode = false;
    favoritesView = false;
    selectedWords = [];
    renderLearn();
  }
  const sessionCurrent = () =>
    session && session.index < session.queue.length
      ? session.queue[session.index] : null;
  const sessionFinished = () =>
    session && session.index >= session.queue.length;

  function answerSession(correct) {
    const w = sessionCurrent();
    if (!w) return;
    const wasNew = statusOf(w) === "new";
    const oldSrs = clone(w.srs);
    applyAnswer(w, correct);
    if (correct) session.knownCount++; else session.unknownCount++;
    bumpActivity(wasNew ? "learned" : "reviewed");
    session.history.push({ idx: session.index, wordIdx: session.queue.indexOf(w), oldSrs });
    session.index++;
    session.revealed = false;
    session.typedInput = "";
    session.typedChecked = false;
    session.typedCorrect = false;
    session.typedNear = false;
    session.gapsCache = "";
    session.choices = null;
    session.choicePicked = null;
    saveData();
    renderLearn(); renderTabs();
    if (settings.autoSpeak && sessionCurrent() && learnMode === "learn") {
      setTimeout(() => speakWord(sessionCurrent(), false, true), 200);
    }
  }
  function backSession() {
    if (!session || !session.history.length) return;
    const last = session.history.pop();
    const w = session.queue[last.wordIdx];
    if (!w) return;
    w.srs = last.oldSrs;
    if (session.knownCount > 0 || session.unknownCount > 0) {
      if (statusOf(w) === "known") session.unknownCount = Math.max(0, session.unknownCount - 1);
    }
    session.index = last.idx;
    session.revealed = false;
    session.typedInput = "";
    session.typedChecked = false;
    session.typedCorrect = false;
    session.typedNear = false;
    session.gapsCache = "";
    session.choices = null;
    session.choicePicked = null;
    saveData();
    renderLearn(); renderTabs();
    toast("Вернулись назад");
  }
  function skipCurrent() {
    if (!session || sessionFinished()) return;
    const w = sessionCurrent();
    if (!w) return;
    session.queue.splice(session.index, 1);
    session.queue.push(w);
    if (session.index >= session.queue.length) session.index = session.queue.length - 1;
    session.revealed = false;
    session.typedInput = "";
    session.typedChecked = false;
    session.typedCorrect = false;
    session.typedNear = false;
    session.gapsCache = "";
    session.choices = null;
    session.choicePicked = null;
    renderLearn();
  }

  const sessionLabel = t => t === "new" ? "новые"
    : t === "unknown" ? "повтор"
    : t === "due" ? "сейчас"
    : t === "favorites" ? "избранное"
    : "все слова";

  function exampleBlock(w, revealed) {
    if (!w.example && !w.exampleTranslation) return "";
    const cls = revealed ? "" : "hidden";
    return (w.example
      ? '<div class="example ' + cls + '">' + esc(w.example) + '</div>' : "") +
      (w.exampleTranslation
        ? '<div class="example-trans ' + cls + '">' +
            esc(w.exampleTranslation) + '</div>' : "");
  }

  /* ============================================================
     КАРТОЧКА ВВОДА
     ============================================================ */
  function renderTypingCard(w) {
    const isTE = learnMode === "type-en";
    const isTR = learnMode === "type-ru";
    const isG  = learnMode === "gaps";
    const isD  = learnMode === "dictate";
    const isRD = learnMode === "dictate-reverse";
    let prompt = "", hint = "", ph = "Ваш ответ...";
    if (isTE) {
      prompt = '<div class="type-prompt">' + esc(w.translation) + '</div>';
      hint = 'Напишите слово'; ph = "Иностранное слово";
    } else if (isTR) {
      prompt = '<div class="type-prompt">' + esc(w.word) + '</div>' +
        (w.transcription
          ? '<div class="transcription">' + esc(w.transcription) + '</div>' : "");
      hint = 'Напишите перевод'; ph = "Перевод";
    } else if (isG) {
      if (!session.gapsCache) session.gapsCache = makeGaps(w.word);
      prompt = '<div class="type-prompt gaps">' + esc(session.gapsCache) + '</div>';
      hint = 'Введите слово полностью'; ph = "Слово целиком";
    } else if (isD) {
      prompt = '<div class="type-prompt dictate">' +
        '<button type="button" class="dictate-btn" data-act="speak" aria-label="Прослушать">' +
          '<i class="ri-volume-up-line"></i></button>' +
        '<button type="button" class="dictate-btn" data-act="speak-slow" aria-label="Медленно">' +
          '<i class="ri-speed-mini-line"></i></button></div>';
      hint = 'Прослушайте и напишите'; ph = "Услышанное слово...";
    } else if (isRD) {
      prompt = '<div class="type-prompt dictate">' +
        '<button type="button" class="dictate-btn" data-act="speak-translation" aria-label="Перевод">' +
          '<i class="ri-volume-up-line"></i></button>' +
        '<button type="button" class="dictate-btn" data-act="speak-translation-slow" aria-label="Медленно">' +
          '<i class="ri-speed-mini-line"></i></button></div>';
      hint = 'Прослушайте перевод и напишите слово'; ph = "Иностранное слово";
    }
    const inputCls = session.typedChecked
      ? "type-input " + (session.typedCorrect ? "input-ok" : (session.typedNear ? "input-near" : "input-bad"))
      : "type-input";
    let fb = "";
    if (session.typedChecked) {
      if (session.typedCorrect) {
        fb = '<div class="type-feedback ok"><i class="ri-check-line"></i> Верно' +
          '<span class="feedback-pair"><b>' + esc(w.word) + '</b>' +
          (w.transcription ? ' <i>' + esc(w.transcription) + '</i>' : '') +
          ' — ' + esc(w.translation) + '</span></div>';
      } else if (session.typedNear) {
        fb = '<div class="type-feedback bad"><i class="ri-error-warning-line"></i> Почти! Опечатка. Правильно: <b>' +
          esc(w.word) + '</b>' +
          (w.transcription ? ' <i>' + esc(w.transcription) + '</i>' : '') +
          ' — ' + esc(w.translation) + '</div>';
      } else {
        fb = '<div class="type-feedback bad"><i class="ri-close-line"></i> Правильный ответ: <b>' +
          esc(w.word) + '</b>' +
          (w.transcription ? ' <i>' + esc(w.transcription) + '</i>' : '') +
          ' — ' + esc(w.translation) + '</div>';
      }
    }
    const actions = session.typedChecked
      ? '<button type="button" data-act="next" class="primary">Дальше</button>' +
        '<button type="button" data-act="know">Проверено</button>' +
        '<button type="button" data-act="unknown">Не знаю</button>'
      : '<button type="button" data-act="check" class="primary"' +
          (session.typedInput.trim() === "" ? ' disabled' : '') + '>Проверить</button>' +
        '<button type="button" data-act="reveal">Показать ответ</button>' +
        '<button type="button" data-act="unknown">Не знаю</button>';
    return '<div class="card">' + prompt +
      '<div class="type-hint">' + esc(hint) + '</div>' +
      '<input id="typeInput" class="' + inputCls + '" type="text" placeholder="' + esc(ph) + '" ' +
        'autocomplete="off" spellcheck="false" value="' + esc(session.typedInput) + '" ' +
        (session.typedChecked ? 'disabled' : '') + '>' +
      fb +
    '</div>' +
    '<div class="actions column">' + actions + '</div>' +
    '<div class="progress">' + (session.index + 1) + ' / ' + session.queue.length +
      ' · ' + sessionLabel(session.type) +
      '<button type="button" class="exit-link" data-act="edit-current">изменить</button>' +
      '<button type="button" class="exit-link" data-act="exit">выйти</button>' +
    '</div>';
  }

  /* ============================================================
     КАРТОЧКА ВЫБОРА
     ============================================================ */
  function buildChoices(w, all) {
    const correct = w.translation;
    const same = [], other = [];
    all.forEach(x => {
      if (x === w || !x.translation || x.translation === correct) return;
      (x.type === w.type ? same : other).push(x.translation);
    });
    const u = a => Array.from(new Set(a));
    const p = shuffle(u(same)).slice(0, 3);
    const e = shuffle(u(other)).slice(0, 3);
    const m = u(p.concat(e)).slice(0, 3);
    while (m.length < 3) m.push("—");
    return shuffle(m.concat([correct]));
  }
  function renderChoiceCard(w) {
    if (!session.choices) {
      session.choices = buildChoices(w, currentWords());
      session.choicePicked = null;
    }
    const choices = session.choices;
    const picked = session.choicePicked;
    const correct = w.translation;
    const prompt = '<div class="type-prompt">' + esc(w.word) + '</div>' +
      (w.transcription
        ? '<div class="transcription">' + esc(w.transcription) + '</div>' : "");
    let list = '<div class="choice-list">';
    choices.forEach((c, i) => {
      let cls = "choice-btn";
      if (picked !== null) {
        if (c === correct) cls += " correct";
        else if (i === picked) cls += " wrong";
      }
      list += '<button type="button" class="' + cls + '" data-choice="' + i + '" ' +
        (picked !== null ? 'disabled' : '') + '>' + esc(c) + '</button>';
    });
    list += '</div>';
    let fb = "";
    if (picked !== null) {
      const ok = choices[picked] === correct;
      const pair = '<span class="feedback-pair"><b>' + esc(w.word) + '</b>' +
        (w.transcription ? ' <i>' + esc(w.transcription) + '</i>' : '') +
        ' — ' + esc(w.translation) + '</span>';
      fb = '<div class="choice-feedback ' + (ok ? 'ok' : 'bad') + '">' +
        (ok ? 'Верно' : 'Правильный ответ:') + pair + '</div>';
    }
    const actions = picked !== null
      ? '<button type="button" data-act="choice-next" class="primary">Дальше</button>' +
        '<button type="button" data-act="unknown">Не знаю</button>'
      : '<button type="button" data-act="reveal-choice" class="primary">Показать ответ</button>' +
        '<button type="button" data-act="unknown">Не знаю</button>';
    return '<div class="card">' + prompt + list + fb + '</div>' +
      '<div class="actions column">' + actions + '</div>' +
      '<div class="progress">' + (session.index + 1) + ' / ' + session.queue.length +
        ' · ' + sessionLabel(session.type) +
        '<button type="button" class="exit-link" data-act="edit-current">изменить</button>' +
        '<button type="button" class="exit-link" data-act="exit">выйти</button>' +
      '</div>';
  }

  /* ============================================================
     ЭКРАН «ИЗБРАННОЕ» (внутри view-learn)
     ============================================================ */
  function renderFavoritesView() {
    const el = $("view-learn");
    const all = currentWords();
    const favWords = all.filter(w => w.isFavorite);
    const favCount = favWords.length;

    const header =
      '<div class="actions" style="margin-bottom:12px">' +
        '<button type="button" data-act="fav-back">' +
          '<i class="ri-arrow-left-line"></i>Назад' +
        '</button>' +
        (favCount > 0
          ? '<button type="button" data-act="fav-start" class="primary">' +
              '<i class="ri-star-line"></i>Учить (' +
              (limit > 0 ? Math.min(limit, favCount) : favCount) + ')' +
            '</button>'
          : '') +
      '</div>';

    el.innerHTML = header + searchHtml() +
      '<div class="words-list-inner">' + buildFavoritesList() + '</div>';
    applyMassUI();
  }

  /* ============================================================
     ГЛАВНЫЙ ВИД
     ============================================================ */
  function renderLearn() {
    const el = $("view-learn");
    if (!currentLang) {
      el.innerHTML = '<div class="card"><div class="hint-text">Создайте язык</div></div>';
      return;
    }
    if (!currentSection) {
      el.innerHTML = '<div class="card"><div class="hint-text">Создайте раздел</div></div>';
      return;
    }

    if (favoritesView && !session && !selectMode) {
      renderFavoritesView();
      return;
    }

    const inS = session && !sessionFinished();
    if (inS) {
      const w = sessionCurrent();
      if (learnMode === "choice") {
        el.innerHTML = renderChoiceCard(w);
        attachCardSwipe();
        return;
      }
      const isTyping = learnMode !== "learn";
      if (isTyping) {
        el.innerHTML = renderTypingCard(w);
        setTimeout(() => {
          const i = $("typeInput");
          if (i && !session.typedChecked) i.focus();
        }, 0);
        if ((learnMode === "dictate" || learnMode === "dictate-reverse") &&
            !session.typedChecked && session._spokenFor !== session.index) {
          session._spokenFor = session.index;
          setTimeout(() => {
            if (learnMode === "dictate-reverse") speakTranslation(w, false);
            else speakWord(w, false, true);
          }, 150);
        }
        return;
      }
      const total = session.queue.length;
      const num = session.index + 1;
      const revealed = session.revealed;
      const actions = revealed
        ? '<button type="button" data-act="know" class="primary">Проверено</button>' +
          '<button type="button" data-act="unknown">Не знаю</button>' +
          '<button type="button" data-act="speak-current"><i class="ri-volume-up-line"></i> Озвучить</button>'
        : '<button type="button" data-act="show" class="primary">Показать</button>' +
          '<button type="button" data-act="speak-current"><i class="ri-volume-up-line"></i> Озвучить</button>';
      const tr = w.transcription
        ? '<div class="transcription ' + (revealed ? '' : 'hidden') + '">' +
            esc(w.transcription) + '</div>' : "";
      el.innerHTML = '<div class="card">' +
        '<div class="word">' + esc(w.word) + '</div>' + tr +
        '<div class="translation ' + (revealed ? '' : 'hidden') + '">' +
          esc(w.translation) + '</div>' +
        exampleBlock(w, revealed) + '</div>' +
        '<div class="actions column">' + actions + '</div>' +
        '<div class="progress">' + num + ' / ' + total + ' · ' +
          sessionLabel(session.type) +
          '<button type="button" class="exit-link" data-act="edit-current">изменить</button>' +
          '<button type="button" class="exit-link" data-act="exit">выйти</button></div>';
      attachCardSwipe();
      if (settings.autoSpeak && session._spokenFor !== session.index) {
        session._spokenFor = session.index;
        setTimeout(() => speakWord(w, false, true), 150);
      }
      return;
    }
    if (selectMode) { renderSelect(); return; }

    const settingsHtml = '<div class="settings">' +
      orderBarHtml() + limitBarHtml() + modeBarHtml() + '</div>';

    if (session && sessionFinished()) {
      const total = session.queue.length;
      let btns = "";
      if (session.unknownCount > 0)
        btns += '<button type="button" data-act="repeat-unknown" class="primary">' +
          'Повторить незнакомые (' + session.unknownCount + ')</button>';
      if (total > 0)
        btns += '<button type="button" data-act="repeat-all">' +
          'Повторить все (' + total + ')</button>';
      btns += '<button type="button" data-act="new-session">Учить новые</button>';
      el.innerHTML = settingsHtml + statsCardHtml() +
        '<div class="card"><div class="big">Сессия завершена</div>' +
          '<div class="stats-row"><span>Проверено: <b>' + session.knownCount +
            '</b></span>' +
          '<span>На повтор: <b>' + session.unknownCount + '</b></span></div></div>' +
        '<div class="actions column">' + btns + '</div>' +
        addFormHtml() + searchHtml() +
        '<div class="words-list-inner">' + buildNewWordsList() + '</div>';
      applyMassUI();
      return;
    }

    const words = currentWords();
    if (words.length === 0) {
      el.innerHTML = settingsHtml + statsCardHtml() +
        '<div class="card"><div class="hint-text">В разделе пока нет слов</div></div>' +
        addFormHtml();
      return;
    }

    const newW = words.filter(w => statusOf(w) === "new");
    const unkW = words.filter(w => statusOf(w) === "unknown");
    const dueW = words.filter(isDue);
    const favW = words.filter(w => w.isFavorite);
    const effN = limit > 0 ? Math.min(limit, newW.length) : newW.length;
    const effU = limit > 0 ? Math.min(limit, unkW.length) : unkW.length;
    const effD = limit > 0 ? Math.min(limit, dueW.length) : dueW.length;
    const effF = limit > 0 ? Math.min(limit, favW.length) : favW.length;

    let btns = "";
    if (dueW.length > 0)
      btns += '<button type="button" data-act="start-due" class="primary">' +
        'Сейчас повторить (' + effD + ')</button>';
    if (newW.length > 0)
      btns += '<button type="button" data-act="start-new"' +
        (dueW.length ? '' : ' class="primary"') +
        '>Учить новые (' + effN + ')</button>';
    if (unkW.length > 0)
      btns += '<button type="button" data-act="start-unknown">' +
        'Повторить незнакомые (' + effU + ')</button>';
    if (favW.length > 0)
      btns += '<button type="button" data-act="start-favorites">' +
        'Учить избранное (' + effF + ')</button>';
    if (!btns)
      btns = '<button type="button" data-act="start-all">Пройти все заново</button>';

    btns += '<button type="button" data-act="open-favorites">' +
      '<i class="ri-star-line"></i>Избранное (' + favW.length + ')</button>';
    btns += '<button type="button" data-act="open-select">Выбрать вручную</button>';

    el.innerHTML = settingsHtml + statsCardHtml() +
      '<div class="card"><div class="hint-text">' +
        (newW.length === 0 && dueW.length === 0
          ? "Новых и просроченных слов нет"
          : "Готово к изучению: " + newW.length +
            (dueW.length ? " · к повтору: " + dueW.length : "")) +
      '</div></div>' +
      '<div class="actions column">' + btns + '</div>' +
      addFormHtml() + searchHtml() +
      '<div class="words-list-inner">' + buildNewWordsList() + '</div>';
    applyMassUI();
  }

  function attachCardSwipe() {
    const card = document.querySelector("#view-learn .card");
    if (!card || !session || sessionFinished()) return;
    if (learnMode === "learn") {
      attachSwipe(card, {
        onRight: () => {
          if (session.revealed) answerSession(true);
          else { session.revealed = true; renderLearn(); }
        },
        onLeft: () => { if (session.revealed) answerSession(false); }
      });
    } else if (learnMode !== "choice") {
      attachSwipe(card, { onLeft: () => answerSession(false) });
    }
  }

  /* ============================================================
     ПРОВЕРКА ОТВЕТА
     ============================================================ */
  function checkTypedAnswer() {
    if (!session) return;
    const w = sessionCurrent();
    if (!w) return;
    let res = { ok: false, near: false };
    if (learnMode === "type-en") res = checkTyped(session.typedInput, w, "word");
    else if (learnMode === "type-ru") res = checkTyped(session.typedInput, w, "translation");
    else if (learnMode === "gaps") res = checkTyped(session.typedInput, w, "word");
    else if (learnMode === "dictate") res = checkTyped(session.typedInput, w, "word");
    else if (learnMode === "dictate-reverse") res = checkTyped(session.typedInput, w, "word");
    session.typedCorrect = res.ok;
    session.typedNear = res.near;
    session.typedChecked = true;
    if (res.ok && (learnMode === "type-en" || learnMode === "dictate-reverse"))
      setTimeout(() => speakWord(w, false, true), 200);
    renderLearn();
  }

  /* ============================================================
     РУЧНОЙ ВЫБОР
     ============================================================ */
  function renderSelect() {
    const el = $("view-learn");
    const all = currentWords();
    if (all.length === 0) {
      el.innerHTML = '<div class="card"><div class="hint-text">Нет слов</div></div>';
      return;
    }
    el.innerHTML =
      searchHtml() +
      '<div class="select-toolbar">' +
        '<button type="button" data-act="select-new">+ новые</button>' +
        '<button type="button" data-act="select-due">+ сейчас</button>' +
        '<button type="button" data-act="select-unknown">+ незнакомые</button>' +
        '<button type="button" data-act="select-all">+ все</button>' +
        '<button type="button" data-act="select-none">Снять всё</button>' +
      '</div>' +
      '<div class="select-toolbar">' +
        '<button type="button" data-act="select-fav">★ В избранное</button>' +
        '<button type="button" data-act="select-unfav">☆ Из избранного</button>' +
      '</div>' +
      '<div id="selectBody"></div>';
    renderSelectBody();
  }

  function renderSelectBody() {
    const body = $("selectBody");
    if (!body) return;
    const all = currentWords();
    const words = filterWords(all);
    const sel = new Set(selectedWords);
    let html = "";

    if (words.length === 0) {
      html += '<div class="list-empty">Ничего не найдено</div>';
    } else {
      html += '<div class="select-list">';
      words.forEach(w => {
        const i = all.indexOf(w);
        const st = statusOf(w);
        const lbl = st === "known"   ? '<span class="select-status is-known">проверено</span>'
                  : st === "unknown" ? '<span class="select-status is-unknown">на повтор</span>'
                  :                    '<span class="select-status">новое</span>';
        const star = w.isFavorite
          ? '<span class="select-status is-fav" title="В избранном">★</span>' : "";
        const tr = w.transcription
          ? '<div class="list-transcription">' + esc(w.transcription) + '</div>' : "";
        html += '<div class="select-row">' +
          '<input type="checkbox" id="sel-' + i + '" data-idx="' + i + '"' +
            (sel.has(w) ? ' checked' : '') + '>' +
          '<label class="select-main" for="sel-' + i + '">' +
            '<div class="list-word">' + esc(w.word) + lbl + star + '</div>' + tr +
            '<div class="list-trans">' + esc(w.translation) + '</div>' +
          '</label>' +
          '<button type="button" class="list-btn fav" data-fav-toggle="' + i +
            '" title="Избранное" aria-label="Избранное">' +
            '<i class="' + (w.isFavorite ? "ri-star-fill" : "ri-star-line") + '"></i>' +
          '</button>' +
          '<button type="button" class="list-btn" data-speak="' + esc(w.word) +
            '" aria-label="Прослушать">' +
            '<i class="ri-volume-up-line"></i></button>' +
          '<button type="button" class="list-btn" data-edit-sel="' + i +
            '" aria-label="Редактировать">' +
            '<i class="ri-edit-line"></i></button>' +
        '</div>';
      });
      html += '</div>';
    }

    const n = selectedWords.length;
    html += '<div class="actions column" style="margin-top:24px">' +
      '<button type="button" data-act="select-start" class="primary"' +
        (n === 0 ? ' disabled' : '') + '>' +
        (n === 0 ? 'Ничего не выбрано' : 'Учить выбранные (' + n + ')') + '</button>' +
      '<button type="button" data-act="select-cancel">Отмена</button>' +
    '</div>';
    body.innerHTML = html;
  }

  function updateSelectButton() {
    const b = document.querySelector('button[data-act="select-start"]');
    if (!b) return;
    const n = selectedWords.length;
    b.textContent = n === 0 ? "Ничего не выбрано" : "Учить выбранные (" + n + ")";
    b.disabled = n === 0;
  }
  function setAllCheckboxes(pred) {
    const cbs = document.querySelectorAll('#selectBody input[type=checkbox]');
    const all = currentWords();
    selectedWords = [];
    cbs.forEach(cb => {
      const w = all[+cb.dataset.idx];
      if (!w) return;
      const on = pred(w);
      cb.checked = on;
      if (on) selectedWords.push(w);
    });
    updateSelectButton();
  }

  /* ============================================================
     МАССОВЫЕ ОПЕРАЦИИ
     ============================================================ */
  function startMass() { massMode = true; massSet.clear(); }
  function exitMass() { massMode = false; massSet.clear(); applyMassUI(); }
  function toggleMass(w) {
    if (massSet.has(w)) massSet.delete(w); else massSet.add(w);
  }
  function applyMassUI() {
    const bar = $("massBar");
    if (bar) bar.hidden = !massMode;
    const cnt = $("massCount");
    if (cnt) cnt.textContent = String(massSet.size);
    if (bar) bar.querySelectorAll("[data-mass]").forEach(b => {
      if (b.dataset.mass === "clear") return;
      b.disabled = massSet.size === 0;
    });
    ["learn","due","known","unknown"].forEach(tab => {
      const v = $("view-" + tab);
      if (!v) return;
      const words = currentWordsForTab(tab);
      v.querySelectorAll(".mass-check").forEach(cb => {
        const w = words[+cb.dataset.massCheck];
        if (!w) return;
        const on = massMode && massSet.has(w);
        cb.checked = on;
        cb.hidden = !massMode;
        const row = cb.closest(".list-row");
        if (row) row.classList.toggle("is-selected", on);
      });
    });
  }
  function massApplyStatus(target) {
    const words = currentWords();
    const changes = [];
    words.forEach(w => {
      if (!massSet.has(w)) return;
      const oldSrs = clone(w.srs);
      if (target === "known")
        w.srs = { box:3, due:Date.now()+7*DAY_MS, reps:1, lapses:0 };
      else if (target === "unknown")
        w.srs = { box:0, due:Date.now()+SHORT_DUE_MS, reps:1, lapses:1 };
      else
        w.srs = { box:0, due:0, reps:0, lapses:0 };
      changes.push({ word: w, oldSrs });
    });
    if (changes.length) {
      pushUndo("Изменение статуса " + changes.length + " слов", () => {
        changes.forEach(c => { c.word.srs = c.oldSrs; });
        saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
      });
    }
    return changes.length;
  }
  function massRemove() {
    const words = currentWords();
    const removed = [];
    Array.from(massSet).forEach(w => {
      const i = words.indexOf(w);
      if (i !== -1) { words.splice(i, 1); removed.push({ word: w, idx: i }); }
    });
    if (removed.length) {
      pushUndo("Удаление " + removed.length + " слов", () => {
        const sec = currentSectionObj();
        if (!sec) return;
        const sorted = removed.slice().sort((a, b) => b.idx - a.idx);
        sorted.forEach(r => sec.words.splice(r.idx, 0, r.word));
        saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
      });
    }
    return removed.length;
  }
  function massMove(targetSection) {
    const words = currentWords();
    const moved = [];
    Array.from(massSet).forEach(w => {
      const i = words.indexOf(w);
      if (i !== -1) { words.splice(i, 1); targetSection.words.push(w); moved.push({ word: w, idx: i }); }
    });
    if (moved.length) {
      pushUndo("Перенос " + moved.length + " слов", () => {
        moved.forEach(m => {
          const j = targetSection.words.indexOf(m.word);
          if (j !== -1) targetSection.words.splice(j, 1);
        });
        const sec = currentSectionObj();
        if (!sec) return;
        const sorted = moved.slice().sort((a, b) => b.idx - a.idx);
        sorted.forEach(m => sec.words.splice(m.idx, 0, m.word));
        saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
      });
    }
    return moved.length;
  }

  /* ============================================================
     РЕДАКТИРОВАНИЕ
     ============================================================ */
  function refreshEditTypeLabel() {
    const el = $("editType");
    if (!el) return;
    const cur = TYPE_OPTIONS.find(o => o.value === editFormType) || TYPE_OPTIONS[0];
    const lbl = el.querySelector(".custom-select-label");
    if (lbl) {
      lbl.textContent = cur.label;
      lbl.classList.remove("placeholder");
    }
  }
  function openEdit(w) {
    editingWord = w;
    editFormType = w.type || "other";
    $("editWord").value = w.word;
    $("editTranscription").value = w.transcription || "";
    $("editTrans").value = w.translation;
    $("editAltTrans").value = (w.altTranslations || []).join("; ");
    refreshEditTypeLabel();
    $("editTags").value = (w.tags || []).join(", ");
    $("editExample").value = w.example || "";
    $("editExampleTrans").value = w.exampleTranslation || "";
    $("editSynonyms").value = (w.synonyms || []).join("; ");
    $("editAntonyms").value = (w.antonyms || []).join("; ");
    $("editNotes").value = w.notes || "";
    $("editDialog").showModal();
  }

  /* ============================================================
     СЕЛЕКТЫ ЯЗЫКА И РАЗДЕЛА
     ============================================================ */
  function renderLangSelect() {
    const codes = Object.keys(data).filter(c => !c.startsWith("_"));
    const items = codes.map(c => ({
      value: c,
      label: data[c].name,
      icon: "ri-global-line",
      count: Object.keys(data[c].sections || {}).length
    }));
    if (!data[currentLang]) currentLang = codes[0] || null;
    renderCustomSelect("langSel", items, currentLang, v => {
      if (v === currentLang) return;
      currentLang = v;
      currentSection = null;
      session = null; selectMode = false; favoritesView = false;
      selectedWords = [];
      searchQuery = ""; exitMass();
      renderLangSelect();
      switchTab(activeTab);
    }, "ri-global-line");
    renderSectionSelect();
    updateBreadcrumb();
  }
  function renderSectionSelect() {
    const lang = currentLangObj();
    if (!lang) {
      renderCustomSelect("sectionSel", [], null, () => {}, "ri-folder-line");
      updateBreadcrumb();
      return;
    }
    const codes = Object.keys(lang.sections);
    const items = codes.map(c => {
      const sec = lang.sections[c];
      const total = sec.words.length;
      const known = sec.words.filter(w => statusOf(w) === "known").length;
      return {
        value: c,
        label: sec.name,
        icon: "ri-folder-line",
        count: total > 0 ? known + "/" + total : 0
      };
    });
    if (!lang.sections[currentSection]) currentSection = codes[0] || null;
    renderCustomSelect("sectionSel", items, currentSection, v => {
      if (v === currentSection) return;
      currentSection = v;
      session = null; selectMode = false; favoritesView = false;
      selectedWords = [];
      searchQuery = ""; exitMass();
      renderSectionSelect();
      switchTab(activeTab);
    }, "ri-folder-line");
    updateBreadcrumb();
  }

  /* ============================================================
     ЭКСПОРТ / ИМПОРТ
     ============================================================ */
  function exportJSON() {
    const payload = {
      _app: "words", _schemaVersion: SCHEMA_VERSION,
      _exportedAt: new Date().toISOString(),
      languages: data
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)],
      { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words_" + todayKey() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function mergeData(src) {
    for (const c of Object.keys(src)) {
      if (c.startsWith("_")) continue;
      if (!data[c]) { data[c] = src[c]; continue; }
      for (const sc of Object.keys(src[c].sections || {})) {
        const sec = src[c].sections[sc];
        if (!data[c].sections[sc]) data[c].sections[sc] = sec;
        else if (Array.isArray(sec.words))
          data[c].sections[sc].words.push.apply(data[c].sections[sc].words, sec.words);
      }
    }
  }
  function exportStatsCSV() {
    const dates = Object.keys(stats.days || {}).sort();
    if (!dates.length) {
      toast("Нет данных для экспорта");
      return;
    }
    const lines = ["date,learned,reviewed,total"];
    dates.forEach(d => {
      const v = stats.days[d] || {};
      const l = v.learned || 0, r = v.reviewed || 0;
      lines.push([d, l, r, l + r].join(","));
    });
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words_stats_" + todayKey() + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast("CSV сохранён", { type: "success" });
  }

  /* ============================================================
     УДАЛИТЬ С ОТМЕНОЙ
     ============================================================ */
  function removeWordWithUndo(w) {
    const words = currentWords();
    const idx = words.indexOf(w);
    if (idx === -1) return;
    words.splice(idx, 1);
    saveData(); renderTabs();
    if (activeTab === "learn") renderLearn();
    pushUndo("Удаление «" + w.word + "»", () => {
      const sec = currentSectionObj();
      if (!sec) return;
      sec.words.splice(Math.min(idx, sec.words.length), 0, w);
      saveData(); renderTabs();
      if (activeTab === "learn") renderLearn();
    });
    toast('Удалено: «' + w.word + '»', { action: doUndo });
  }

  /* ============================================================
     ДОБАВИТЬ СЛОВО
     ============================================================ */
  function doAddWord() {
    const sec = currentSectionObj();
    if (!sec) { toast("Сначала создайте раздел", { type: "error" }); return; }
    const w = addFormValues.word.trim();
    const t = addFormValues.trans.trim();
    const errors = validateNewWord(w, t, sec.words);
    if (errors.length > 0) { showAddErrors(errors); return; }
    showAddErrors([]);
    const newWord = {
      word: w,
      transcription: addFormValues.transcription.trim(),
      translation: t,
      altTranslations: parseList(addFormValues.altTrans, ";"),
      type: addFormValues.type || "other",
      tags: parseList(addFormValues.tags, ","),
      example: addFormValues.example.trim(),
      exampleTranslation: addFormValues.exampleTrans.trim(),
      synonyms: parseList(addFormValues.synonyms, ";"),
      antonyms: parseList(addFormValues.antonyms, ";"),
      notes: addFormValues.notes.trim(),
      isFavorite: false,
      srs: { box: 0, due: 0, reps: 0, lapses: 0 }
    };
    sec.words.push(newWord);
    saveData(); resetAddForm(); renderTabs();
    if (activeTab === "learn") renderLearn();
    pushUndo("Добавление «" + w + "»", () => {
      const s = currentSectionObj();
      if (!s) return;
      const i = s.words.indexOf(newWord);
      if (i !== -1) s.words.splice(i, 1);
      saveData(); renderTabs();
      if (activeTab === "learn") renderLearn();
    });
    toast("Слово добавлено", { type: "success" });
    setTimeout(() => { const i = $("newWord"); if (i) i.focus(); }, 30);
  }

  /* ============================================================
     ИМПОРТ СЛОВ
     ============================================================ */
  function parseImportLine(line) {
    const cleaned = String(line || "").replace(/\r$/, "").trim();
    if (!cleaned) return null;

    if (cleaned.indexOf(" | ") !== -1) {
      const parts = cleaned.split(" | ").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        let transcription = "", word = "", translation = "";
        for (const p of parts) {
          if (!transcription && /^\[.*\]$/.test(p)) transcription = p;
          else if (!word) word = p;
          else if (!translation) translation = p;
        }
        if (word) return { word, translation, transcription };
      }
    }

    if (cleaned.indexOf("\t") !== -1) {
      const parts = cleaned.split("\t").map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        let transcription = "", word = "", translation = "";
        for (const p of parts) {
          if (!transcription && /^\[.*\]$/.test(p)) transcription = p;
          else if (!word) word = p;
          else if (!translation) translation = p;
        }
        if (word) return { word, translation, transcription };
      }
    }

    const seps = [" — ", " – ", " - ", ";", ":"];
    for (const sep of seps) {
      const idx = cleaned.indexOf(sep);
      if (idx > 0) {
        return {
          word: cleaned.slice(0, idx).trim(),
          translation: cleaned.slice(idx + sep.length).trim(),
          transcription: ""
        };
      }
    }
    const ci = cleaned.indexOf(",");
    if (ci > 0) {
      return {
        word: cleaned.slice(0, ci).trim(),
        translation: cleaned.slice(ci + 1).trim(),
        transcription: ""
      };
    }
    return { word: cleaned, translation: "", transcription: "" };
  }

  async function parseImportText(text) {
    const lines = String(text || "").split(/\r?\n/);
    const result = [];
    for (const line of lines) {
      const pair = parseImportLine(line);
      if (pair) result.push(pair);
    }
    return result;
  }

  async function doImportWords() {
    const sec = currentSectionObj();
    if (!sec) { toast("Сначала создайте раздел", { type: "error" }); return; }
    const activeTabImport = document.querySelector(".import-tab.active").dataset.importTab;
    const autoTr = $("importAutoTranslate").checked;
    let text = "";

    if (activeTabImport === "text") {
      text = $("importText").value || "";
    } else if (activeTabImport === "url") {
      const url = ($("importUrl").value || "").trim();
      if (!url) { toast("Введите URL", { type: "error" }); return; }
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        text = await r.text();
      } catch (e) {
        toast("Не удалось загрузить: " + e.message, { type: "error" });
        return;
      }
    } else if (activeTabImport === "file") {
      const f = $("importWordsFile").files[0];
      if (!f) { toast("Выберите файл", { type: "error" }); return; }
      text = await new Promise(res => {
        const rd = new FileReader();
        rd.onload = () => res(rd.result);
        rd.readAsText(f);
      });
    }

    const pairs = await parseImportText(text);
    if (!pairs.length) { toast("Не найдено ни одной пары", { type: "error" }); return; }

    if (autoTr) {
      toast("Перевожу " + pairs.length + " слов...");
      const toLang = "ru";
      const fromLang = currentLang;
      for (const p of pairs) {
        if (p.translation) continue;
        const t = await autoTranslate(p.word, fromLang, toLang);
        if (t) p.translation = t;
      }
    }

    const existing = new Set(sec.words.map(w => (w.word || "").toLowerCase()));
    let added = 0, skipped = 0, noTrans = 0;
    for (const p of pairs) {
      if (!p.translation) { noTrans++; continue; }
      if (existing.has(p.word.toLowerCase())) { skipped++; continue; }
      sec.words.push(mkWord(p.word, p.transcription || "", p.translation, "other"));
      existing.add(p.word.toLowerCase());
      added++;
    }

    saveData(); renderTabs();
    if (activeTab === "learn") renderLearn();
    $("importDialog").close();
    toast("Добавлено: " + added +
      (skipped ? ", пропущено дублей: " + skipped : "") +
      (noTrans ? ", без перевода: " + noTrans : ""),
      { type: added > 0 ? "success" : "error" });
  }

  /* ============================================================
     СТАТИСТИКА — ОТКРЫТИЕ И РЕНДЕР
     ============================================================ */
  function openStatsDialog() {
    const dlg = $("statsDialog");
    if (!dlg) return;
    renderStatsOverview();
    renderHeatmap();
    renderChart();
    if (!dlg.open) try { dlg.showModal(); } catch (e) {}
  }

  function renderStatsOverview() {
    const el = $("statsOverview");
    if (!el) return;
    const words = currentWords();
    const total = words.length;
    const known = words.filter(w => statusOf(w) === "known").length;
    const due = words.filter(isDue).length;
    const streak = stats.streak || 0;
    const longest = stats.longestStreak || 0;
    const allDays = Object.keys(stats.days || {});
    const activeDays = allDays.filter(d => (stats.days[d].learned || 0) + (stats.days[d].reviewed || 0) > 0).length;
    el.innerHTML =
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-fire-line"></i></span>' +
        '<span class="val">' + streak + '</span>' +
        '<span class="lbl">подряд</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-calendar-check-line"></i></span>' +
        '<span class="val">' + activeDays + '</span>' +
        '<span class="lbl">дней</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-trophy-line"></i></span>' +
        '<span class="val">' + longest + '</span>' +
        '<span class="lbl">рекорд</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-check-double-line"></i></span>' +
        '<span class="val">' + known + '/' + total + '</span>' +
        '<span class="lbl">выучено</span>' +
      '</div>' +
      '<div class="stats-cell">' +
        '<span class="stats-icon"><i class="ri-time-line"></i></span>' +
        '<span class="val">' + due + '</span>' +
        '<span class="lbl">к повтору</span>' +
      '</div>';
  }

  function renderHeatmap() {
    const el = $("heatmap");
    if (!el) return;
    const WEEKS = 13;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDay = new Date(today);
    const startDay = new Date(today);
    startDay.setDate(startDay.getDate() - (WEEKS * 7 - 1));
    while (startDay.getDay() !== 0) startDay.setDate(startDay.getDate() - 1);
    const days = [];
    const cur = new Date(startDay);
    while (cur <= endDay) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    let maxAct = 1;
    days.forEach(d => {
      const k = todayKey(d);
      const v = stats.days[k] || {};
      const total = (v.learned || 0) + (v.reviewed || 0);
      if (total > maxAct) maxAct = total;
    });
    el.innerHTML = days.map(d => {
      const k = todayKey(d);
      const v = stats.days[k] || {};
      const total = (v.learned || 0) + (v.reviewed || 0);
      let level = 0;
      if (total > 0) {
        const ratio = total / maxAct;
        if (ratio < 0.25) level = 1;
        else if (ratio < 0.5) level = 2;
        else if (ratio < 0.75) level = 3;
        else level = 4;
      }
      const title = k + " — " + total + " " + plural(total, "слово", "слова", "слов");
      return '<div class="heatmap-cell" data-level="' + level + '" title="' + title + '"></div>';
    }).join("");
  }

  function renderChart() {
    const el = $("chart");
    if (!el) return;
    const DAYS = 14;
    const days = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    let maxV = 1;
    const values = days.map(d => {
      const k = todayKey(d);
      const v = stats.days[k] || {};
      const total = (v.learned || 0) + (v.reviewed || 0);
      if (total > maxV) maxV = total;
      return total;
    });
    el.innerHTML = days.map((d, i) => {
      const v = values[i];
      const pct = Math.max(2, Math.round(v / maxV * 100));
      return '<div class="chart-bar' + (v === 0 ? " is-zero" : "") +
        '" data-count="' + v + '" style="height:' + pct + '%" title="' + todayKey(d) + '"></div>';
    }).join("");
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ============================================================
     ИМПОРТ — ОТКРЫТИЕ
     ============================================================ */
  function openImportDialog() {
    const dlg = $("importDialog");
    if (!dlg) return;
    if (!currentSection) { toast("Сначала выберите раздел", { type: "error" }); return; }
    $("importText").value = "";
    $("importUrl").value = "";
    $("importWordsFile").value = "";
    $("importAutoTranslate").checked = false;
    switchImportTab("text");
    if (!dlg.open) try { dlg.showModal(); } catch (e) {}
  }
  function switchImportTab(tab) {
    document.querySelectorAll(".import-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.importTab === tab);
    });
    document.querySelectorAll(".import-panel").forEach(p => {
      p.hidden = p.dataset.importPanel !== tab;
    });
  }

  /* ============================================================
     КНОПКИ ПРОКРУТКИ
     ============================================================ */
  function updateScrollBtns() {
    const w = $("scrollButtons");
    if (!w) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    const scrollable = document.documentElement.scrollHeight >
      window.innerHeight + 200;
    if (!scrollable) { w.hidden = true; return; }
    w.hidden = y < 200;
  }

  /* ============================================================
     ПОИСК
     ============================================================ */
  const searchDebounce = debounce(v => {
    searchQuery = v;
    document.querySelectorAll(".search-clear").forEach(b => {
      b.hidden = searchQuery === "";
    });
    if (activeTab === "learn") {
      if (selectMode) { renderSelectBody(); return; }
      const inner = document.querySelector("#view-learn .words-list-inner");
      if (!inner) return;
      if (favoritesView) inner.innerHTML = buildFavoritesList();
      else               inner.innerHTML = buildNewWordsList();
    } else if (activeTab === "due") {
      const inner = document.querySelector("#view-due .words-list-inner");
      if (inner) inner.innerHTML = buildDueList();
    } else if (activeTab === "known") {
      const inner = document.querySelector("#view-known .words-list-inner");
      if (inner) inner.innerHTML = buildStatusList("known");
    } else if (activeTab === "unknown") {
      const inner = document.querySelector("#view-unknown .words-list-inner");
      if (inner) inner.innerHTML = buildStatusList("unknown");
    }
    applyMassUI();
    updateScrollBtns();
  }, 150);

  function clearSearch() {
    searchQuery = "";
    document.querySelectorAll(".search-input").forEach(i => { i.value = ""; });
    document.querySelectorAll(".search-clear").forEach(b => { b.hidden = true; });
    if (activeTab === "learn") {
      if (selectMode) { renderSelectBody(); return; }
      const inner = document.querySelector("#view-learn .words-list-inner");
      if (!inner) return;
      if (favoritesView) inner.innerHTML = buildFavoritesList();
      else               inner.innerHTML = buildNewWordsList();
    }
    else if (activeTab === "due")     renderList("view-due", "due");
    else if (activeTab === "known")   renderList("view-known", "known");
    else if (activeTab === "unknown") renderList("view-unknown", "unknown");
    applyMassUI();
  }

  /* ============================================================
     ОБРАБОТЧИКИ
     ============================================================ */
  function bindAll() {

    document.addEventListener("click", e => {
      const tab = e.target.closest(".tab");
      if (tab && tab.dataset.tab) { e.preventDefault(); switchTab(tab.dataset.tab); }
    });

    $("themeToggle").onclick = () => {
      const cur = document.documentElement.dataset.theme;
      const next = cur === "dark" ? "light" : "dark";
      settings.theme = next;
      saveSettings();
      applyTheme(next);
      updateSettingsUI();
    };

    $("settingsBtn").onclick = () => {
      renderHotkeysList();
      updateSettingsUI();
      const dlg = $("settingsDialog");
      if (!dlg.open) try { dlg.showModal(); } catch (e) {}
    };
    $("settingsClose").onclick = e => {
      e.preventDefault();
      $("settingsDialog").close();
    };
    document.querySelectorAll("#setTheme [data-theme-val]").forEach(b => {
      b.onclick = () => {
        settings.theme = b.dataset.themeVal;
        saveSettings();
        applyTheme(settings.theme);
        updateSettingsUI();
      };
    });
    document.querySelectorAll("#setFontSize [data-fs]").forEach(b => {
      b.onclick = () => {
        settings.fontSize = b.dataset.fs;
        saveSettings();
        applyFontSize(settings.fontSize);
        updateSettingsUI();
      };
    });
    $("setAutoSpeak").onclick = () => {
      settings.autoSpeak = !settings.autoSpeak;
      saveSettings();
      updateSettingsUI();
    };
    $("setFuzzy").onclick = () => {
      settings.fuzzy = !settings.fuzzy;
      saveSettings();
      updateSettingsUI();
    };

    $("statsBtn").onclick = openStatsDialog;
    $("statsClose").onclick = e => { e.preventDefault(); $("statsDialog").close(); };
    $("exportStatsBtn").onclick = exportStatsCSV;

    $("importWordsBtn").onclick = openImportDialog;
    $("importCancel").onclick = e => { e.preventDefault(); $("importDialog").close(); };
    $("importConfirm").onclick = doImportWords;
    document.querySelectorAll(".import-tab").forEach(t => {
      t.onclick = () => switchImportTab(t.dataset.importTab);
    });

    document.querySelectorAll("[data-close]").forEach(btn => {
      const dlg = $(btn.dataset.close);
      if (!dlg) return;
      btn.onclick = () => { if (dlg.open) dlg.close(); };
    });

    (function bindTypeDialog() {
      const dlg = $("typeDialog");
      if (!dlg) return;
      const closeBtn = dlg.querySelector("[data-close-type]");
      if (closeBtn) closeBtn.onclick = () => { if (dlg.open) dlg.close(); };
      dlg.addEventListener("click", e => {
        if (e.target === dlg && dlg.open) dlg.close();
      });
    })();

    $("editType").addEventListener("click", e => {
      if (!e.target.closest(".custom-select-trigger")) return;
      openTypeDialog(editFormType, v => {
        editFormType = v;
        refreshEditTypeLabel();
      });
    });

    $("addLangBtn").onclick = async () => {
      const code = await askText("Код языка ISO 639-1", {
        placeholder: "tr, mk, el, sr...",
        message: POPULAR_LANGS_HINT
      });
      if (!code) return;
      const c = code.trim().toLowerCase().replace(/[^a-z]/g, "");
      if (!c) { toast("Некорректный код", { type: "error" }); return; }
      if (data[c]) { toast("Язык уже есть", { type: "error" }); return; }
      const name = await askText("Название языка", { value: c });
      if (!name) return;
      data[c] = {
        name: name.trim() || c,
        sections: { a1: { name: "A1", words: [] } }
      };
      currentLang = c; currentSection = null;
      session = null; selectMode = false; favoritesView = false;
      saveData(); renderLangSelect(); switchTab(activeTab);
      toast("Язык добавлен", { type: "success" });
    };

    $("addSectionBtn").onclick = async () => {
      const lang = currentLangObj();
      if (!lang) { toast("Сначала создайте язык", { type: "error" }); return; }
      const name = await askText("Название раздела", { placeholder: "A2, «Еда»" });
      if (!name) return;
      const c = uid();
      lang.sections[c] = { name: name.trim(), words: [] };
      currentSection = c;
      saveData(); renderSectionSelect(); switchTab(activeTab);
    };
    $("renameSectionBtn").onclick = async () => {
      const sec = currentSectionObj();
      if (!sec) return;
      const name = await askText("Новое название", { value: sec.name });
      if (!name) return;
      const t = name.trim();
      if (!t || t === sec.name) return;
      sec.name = t;
      saveData(); renderSectionSelect();
      if (activeTab === "learn") renderLearn();
    };
    $("reorderSectionsBtn").onclick = openReorderSections;
    $("delSectionBtn").onclick = async () => {
      const lang = currentLangObj(), sec = currentSectionObj();
      if (!lang || !sec) return;
      const ok = await askConfirm("Удалить раздел?", {
        message: "Язык: " + lang.name + "\nРаздел: " + sec.name +
                 "\nСлов: " + sec.words.length + "\n\nНеобратимо.",
        confirmLabel: "Удалить", danger: true
      });
      if (!ok) return;
      delete lang.sections[currentSection];
      currentSection = null;
      session = null; selectMode = false; favoritesView = false;
      selectedWords = [];
      searchQuery = "";
      saveData(); renderSectionSelect(); switchTab(activeTab);
      toast("Раздел удалён");
    };

    $("exportBtn").onclick = () => {
      exportJSON();
      toast("Файл сохранён", { type: "success" });
    };
    $("importBtn").onclick = () => $("fileInput").click();
    $("fileInput").onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const parsed = migrate(JSON.parse(reader.result));
          const merge = await askConfirm("Импорт", {
            message: "OK — объединить.\nОтмена — заменить всё.",
            confirmLabel: "Объединить"
          });
          if (merge) mergeData(parsed); else data = parsed;
          saveData();
          currentLang = Object.keys(data)[0] || null;
          currentSection = null;
          session = null; selectMode = false; favoritesView = false;
          searchQuery = "";
          renderLangSelect(); switchTab(activeTab);
          toast("Импорт завершён", { type: "success" });
        } catch (err) {
          toast("Ошибка: " + err.message, { type: "error" });
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    };
    $("resetBtn").onclick = async () => {
      const ok = await askConfirm("Сбросить всё?", {
        message: "Все данные будут удалены. Необратимо.",
        confirmLabel: "Сбросить", danger: true
      });
      if (!ok) return;
      data = clone(DEFAULT_DATA);
      currentLang = Object.keys(data)[0] || null;
      currentSection = null;
      session = null; selectMode = false; favoritesView = false;
      searchQuery = "";
      saveData(); renderLangSelect(); switchTab(activeTab);
      toast("Данные сброшены");
    };

    $("editCancel").onclick = e => {
      e.preventDefault();
      $("editDialog").close();
      editingWord = null; editFromSession = false;
    };
    $("editSave").onclick = e => {
      e.preventDefault();
      if (!editingWord) { $("editDialog").close(); return; }
      const w = $("editWord").value.trim();
      const t = $("editTrans").value.trim();
      if (!w || !t) {
        toast("Заполните слово и перевод", { type: "error" });
        return;
      }
      const target = editingWord;
      const before = clone(target);
      target.word = w;
      target.transcription = $("editTranscription").value.trim();
      target.translation = t;
      target.altTranslations = parseList($("editAltTrans").value, ";");
      target.type = editFormType || "other";
      target.tags = parseList($("editTags").value, ",");
      target.example = $("editExample").value.trim();
      target.exampleTranslation = $("editExampleTrans").value.trim();
      target.synonyms = parseList($("editSynonyms").value, ";");
      target.antonyms = parseList($("editAntonyms").value, ";");
      target.notes = $("editNotes").value.trim();
      saveData();
      pushUndo("Изменение «" + w + "»", () => {
        Object.keys(before).forEach(k => { target[k] = before[k]; });
        saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
      });
      $("editDialog").close();
      editingWord = null;
      if (editFromSession) { editFromSession = false; renderLearn(); }
      if (activeTab === "learn")   renderLearn();
      if (activeTab === "due")     renderList("view-due", "due");
      if (activeTab === "known")   renderList("view-known", "known");
      if (activeTab === "unknown") renderList("view-unknown", "unknown");
      renderTabs();
      toast("Сохранено", { type: "success" });
    };

    $("massBar").addEventListener("click", async e => {
      const btn = e.target.closest("[data-mass]");
      if (!btn) return;
      const act = btn.dataset.mass;
      if (act === "clear") { exitMass(); return; }
      if (act === "delete") {
        const ok = await askConfirm("Удалить выделенные?", {
          message: "Будет удалено: " + massSet.size + " сл.",
          confirmLabel: "Удалить", danger: true
        });
        if (!ok) return;
        const n = massRemove();
        exitMass(); saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
        toast("Удалено: " + n, { type: "success", action: doUndo });
        return;
      }
      if (act === "move") {
        const lang = currentLangObj();
        if (!lang) return;
        const codes = Object.keys(lang.sections).filter(c => c !== currentSection);
        if (codes.length === 0) {
          toast("Нет других разделов", { type: "error" });
          return;
        }
        const name = await askText("Куда перенести?", {
          message: "Разделы: " + codes.map(c => lang.sections[c].name).join(", ")
        });
        if (!name) return;
        const target = codes.find(c => lang.sections[c].name === name);
        if (!target) { toast("Раздел не найден", { type: "error" }); return; }
        const n = massMove(lang.sections[target]);
        exitMass(); saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
        toast("Перенесено: " + n, { type: "success", action: doUndo });
        return;
      }
      if (act === "known" || act === "unknown" || act === "reset") {
        const n = massApplyStatus(act);
        exitMass(); saveData(); renderTabs();
        if (activeTab === "learn") renderLearn();
        else renderList("view-" + activeTab, activeTab);
        toast("Обновлено: " + n, { type: "success", action: doUndo });
      }
    });

    /* Клики в view-learn */
    $("view-learn").addEventListener("click", e => {

      /* ==== Экран «Избранное» ==== */
      if (favoritesView && !session && !selectMode) {
        if (e.target.closest(".search-clear")) { clearSearch(); return; }
        const backBtn = e.target.closest('[data-act="fav-back"]');
        if (backBtn) {
          favoritesView = false; searchQuery = "";
          renderLearn(); return;
        }
        const startBtn = e.target.closest('[data-act="fav-start"]');
        if (startBtn) { startSession("favorites"); return; }
        const unfav = e.target.closest("[data-unfavorite]");
        if (unfav) {
          const w = currentWordsForTab("favorites")[+unfav.dataset.unfavorite];
          if (!w) return;
          w.isFavorite = false;
          saveData(); renderTabs(); renderLearn();
          toast("Убрано из избранного");
          return;
        }
        const spF = e.target.closest("[data-speak]");
        if (spF) { speakWord({ word: spF.dataset.speak }, false, false); return; }
        const rsF = e.target.closest("[data-reset]");
        if (rsF) {
          const w = currentWordsForTab("favorites")[+rsF.dataset.reset];
          if (!w) return;
          const oldSrs = clone(w.srs);
          w.srs = { box: 0, due: 0, reps: 0, lapses: 0 };
          pushUndo("Статус «" + w.word + "»", () => {
            w.srs = oldSrs;
            saveData(); renderTabs(); renderLearn();
          });
          saveData(); renderTabs(); renderLearn();
          toast("Возвращено в изучение", { action: doUndo });
          return;
        }
        const edF = e.target.closest("[data-edit]");
        if (edF) {
          const w = currentWordsForTab("favorites")[+edF.dataset.edit];
          if (w) { editFromSession = false; openEdit(w); }
          return;
        }
        return;
      }

      /* Звёздочка в режиме выбора */
      const favToggle = e.target.closest("[data-fav-toggle]");
      if (favToggle && selectMode) {
        const i = +favToggle.dataset.favToggle;
        const w = currentWords()[i];
        if (!w) return;
        w.isFavorite = !w.isFavorite;
        saveData();
        renderTabs();
        renderSelectBody();
        return;
      }

      const chk = e.target.closest("[data-mass-check]");
      if (chk) {
        const words = currentWordsForTab("learn");
        const w = words[+chk.dataset.massCheck];
        if (!w) return;
        if (!massMode) startMass();
        toggleMass(w);
        applyMassUI();
        return;
      }

      if (e.target.closest("#newWordTranslateBtn")) {
        const inp = $("newWord");
        const w = (inp.value || "").trim();
        if (!w) { toast("Введите слово", { type: "error" }); return; }
        const btn = e.target.closest("#newWordTranslateBtn");
        btn.classList.add("loading");
        const ic = btn.querySelector("i");
        if (ic) ic.className = "ri-loader-4-line";
        autoTranslate(w, currentLang, "ru").then(t => {
          btn.classList.remove("loading");
          if (ic) ic.className = "ri-translate-2";
          if (t) {
            addFormValues.trans = t;
            const tr = $("newTrans");
            if (tr) tr.value = t;
            toast("Переведено", { type: "success" });
          } else {
            toast("Не удалось перевести", { type: "error" });
          }
        });
        return;
      }

      if (e.target.closest("#newWordTranscribeBtn")) {
        const inp = $("newWord");
        const w = (inp.value || "").trim();
        if (!w) { toast("Введите слово", { type: "error" }); return; }
        const btn = e.target.closest("#newWordTranscribeBtn");
        btn.classList.add("loading");
        const ic = btn.querySelector("i");
        if (ic) ic.className = "ri-loader-4-line";
        autoTranscribe(w).then(t => {
          btn.classList.remove("loading");
          if (ic) ic.className = "ri-mic-line";
          if (t) {
            addFormValues.transcription = t;
            const ti = $("newTranscription");
            if (ti) ti.value = t;
            toast("Транскрипция получена", { type: "success" });
          } else {
            toast(currentLang === "en" ? "Не найдено" : "Только для английского", { type: "error" });
          }
        });
        return;
      }

      if (e.target.closest("#addBtn")) { doAddWord(); return; }
      if (e.target.closest(".search-clear")) { clearSearch(); return; }

      const typeSel = e.target.closest("#newType");
      if (typeSel && e.target.closest(".custom-select-trigger")) {
        openTypeDialog(addFormValues.type, v => {
          addFormValues.type = v;
          const cur = TYPE_OPTIONS.find(o => o.value === v) || TYPE_OPTIONS[0];
          const el = $("newType");
          if (el) {
            const lbl = el.querySelector(".custom-select-label");
            if (lbl) { lbl.textContent = cur.label; lbl.classList.remove("placeholder"); }
          }
        });
        return;
      }

      const choiceBtn = e.target.closest("[data-choice]");
      if (choiceBtn && session && !sessionFinished() &&
          session.choicePicked === null) {
        session.choicePicked = +choiceBtn.dataset.choice;
        renderLearn(); return;
      }
      const sp = e.target.closest("[data-speak]");
      if (sp) {
        speakWord({ word: sp.dataset.speak }, false, false);
        return;
      }

      const orderBtn = e.target.closest("button[data-order]");
      if (orderBtn) {
        orderMode = orderBtn.dataset.order;
        localStorage.setItem("orderMode", orderMode);
        renderLearn(); return;
      }
      const limitBtn = e.target.closest("button[data-limit]");
      if (limitBtn) {
        limit = parseInt(limitBtn.dataset.limit, 10);
        localStorage.setItem("limitMode", String(limit));
        renderLearn(); return;
      }
      const modeBtn = e.target.closest("button[data-mode]");
      if (modeBtn) {
        learnMode = modeBtn.dataset.mode;
        localStorage.setItem("learnMode", learnMode);
        renderLearn(); return;
      }

      const spkBig = e.target.closest("[data-act='speak']");
      if (spkBig && learnMode === "dictate" && session) {
        const w = sessionCurrent();
        if (w) speakWord(w, false, true);
        return;
      }
      const spkSlow = e.target.closest("[data-act='speak-slow']");
      if (spkSlow && learnMode === "dictate" && session) {
        const w = sessionCurrent();
        if (w) speakWord(w, true, true);
        return;
      }
      const spkTr = e.target.closest("[data-act='speak-translation']");
      if (spkTr && learnMode === "dictate-reverse" && session) {
        const w = sessionCurrent();
        if (w) speakTranslation(w, false);
        return;
      }
      const spkTrSlow = e.target.closest("[data-act='speak-translation-slow']");
      if (spkTrSlow && learnMode === "dictate-reverse" && session) {
        const w = sessionCurrent();
        if (w) speakTranslation(w, true);
        return;
      }

      const mk = e.target.closest("[data-mark-new]");
      if (mk) {
        const list = currentWords().filter(w => statusOf(w) === "new");
        const w = list[+mk.dataset.markNewIdx];
        if (!w) return;
        const oldSrs = clone(w.srs);
        applyAnswer(w, mk.dataset.markNew === "known");
        bumpActivity("learned");
        pushUndo("Статус «" + w.word + "»", () => {
          w.srs = oldSrs;
          saveData(); renderTabs(); renderLearn();
        });
        saveData(); renderTabs(); renderLearn();
        return;
      }

      const btn = e.target.closest("button[data-act]");
      if (!btn) {
        const ed = e.target.closest("[data-edit-new]");
        if (ed) {
          const list = currentWords().filter(w => statusOf(w) === "new");
          const w = list[+ed.dataset.editNew];
          if (w) { editFromSession = false; openEdit(w); }
          return;
        }
        const dl = e.target.closest("[data-delete-new]");
        if (dl) {
          const list = currentWords().filter(w => statusOf(w) === "new");
          const w = list[+dl.dataset.deleteNew];
          if (w) removeWordWithUndo(w);
          return;
        }
        const edS = e.target.closest("[data-edit-sel]");
        if (edS) {
          const w = currentWords()[+edS.dataset.editSel];
          if (w) { editFromSession = false; openEdit(w); }
          return;
        }
        return;
      }
      const act = btn.dataset.act;

      if (act === "show") { session.revealed = true; renderLearn(); return; }
      if (act === "know") { answerSession(true); return; }
      if (act === "unknown") { answerSession(false); return; }

      /* Раскрыть ответ в режиме ввода */
      if (act === "reveal") {
        if (!session || session.typedChecked) return;
        session.typedChecked = true;
        session.typedCorrect = false;
        session.typedNear = false;
        renderLearn();
        return;
      }

      /* Раскрыть правильный ответ в режиме выбора */
      if (act === "reveal-choice") {
        if (!session || session.choicePicked !== null) return;
        session.choicePicked = -2;
        renderLearn();
        return;
      }

      /* Озвучить текущее слово (карточки) */
      if (act === "speak-current") {
        const w = sessionCurrent();
        if (w) speakWord(w, false, true);
        return;
      }

      if (act === "choice-next") {
        const w = sessionCurrent();
        const right = w && session.choices &&
          session.choicePicked >= 0 &&
          session.choices[session.choicePicked] === w.translation;
        answerSession(right); return;
      }
      if (act === "edit-current") {
        const w = sessionCurrent();
        if (w) { editFromSession = true; openEdit(w); }
        return;
      }
      if (act === "exit") { session = null; renderLearn(); return; }
      if (act === "check") { checkTypedAnswer(); return; }
      if (act === "next") { answerSession(session.typedCorrect); return; }

      if (act === "start-new") startSession("new");
      else if (act === "start-unknown") startSession("unknown");
      else if (act === "start-due") startSession("due");
      else if (act === "start-favorites") startSession("favorites");
      else if (act === "start-all") startSession("all");
      else if (act === "repeat-unknown") startSession("unknown");
      else if (act === "repeat-all") startSession("all");
      else if (act === "new-session") { session = null; renderLearn(); }
      else if (act === "open-favorites") {
        favoritesView = true; searchQuery = "";
        session = null; selectMode = false;
        renderLearn();
      }
      else if (act === "open-select") {
        selectMode = true; selectedWords = []; session = null;
        favoritesView = false;
        renderLearn();
      }
      else if (act === "select-cancel") {
        selectMode = false; selectedWords = []; renderLearn();
      }
      else if (act === "select-new")     setAllCheckboxes(w => statusOf(w) === "new");
      else if (act === "select-due")     setAllCheckboxes(w => isDue(w));
      else if (act === "select-unknown") setAllCheckboxes(w => statusOf(w) === "unknown");
      else if (act === "select-all")     setAllCheckboxes(() => true);
      else if (act === "select-none")    setAllCheckboxes(() => false);
      else if (act === "select-fav") {
        if (selectedWords.length === 0) { toast("Ничего не выбрано"); return; }
        let n = 0;
        selectedWords.forEach(w => { if (!w.isFavorite) { w.isFavorite = true; n++; } });
        saveData(); renderTabs(); renderSelectBody();
        toast(n > 0 ? "В избранное добавлено: " + n : "Уже в избранном",
          { type: n > 0 ? "success" : "default" });
      }
      else if (act === "select-unfav") {
        if (selectedWords.length === 0) { toast("Ничего не выбрано"); return; }
        let n = 0;
        selectedWords.forEach(w => { if (w.isFavorite) { w.isFavorite = false; n++; } });
        saveData(); renderTabs(); renderSelectBody();
        toast(n > 0 ? "Из избранного убрано: " + n : "Там ничего не было",
          { type: n > 0 ? "success" : "default" });
      }
      else if (act === "select-start") {
        if (selectedWords.length === 0) return;
        startSession("all", selectedWords);
      }
    });

    $("view-learn").addEventListener("input", e => {
      const t = e.target;
      if (!t) return;
      if (t.classList && t.classList.contains("search-input")) {
        searchDebounce(t.value); return;
      }
      if (!t.id) return;
      const map = {
        newWord:"word", newTranscription:"transcription", newTrans:"trans",
        newAltTrans:"altTrans", newTags:"tags", newExample:"example",
        newExampleTrans:"exampleTrans", newSynonyms:"synonyms",
        newAntonyms:"antonyms", newNotes:"notes"
      };
      if (map[t.id]) {
        addFormValues[map[t.id]] = t.value;
        if (t.id === "newWord" || t.id === "newTrans") showAddErrors([]);
        return;
      }
      if (t.id === "typeInput") {
        if (!session || session.typedChecked) return;
        session.typedInput = t.value;
        const b = document.querySelector('#view-learn button[data-act="check"]');
        if (b) b.disabled = session.typedInput.trim() === "";
      }
    });

    $("view-learn").addEventListener("change", e => {
      const t = e.target;
      const cb = t.closest("input[type=checkbox]");
      if (!cb) return;
      if (cb.dataset.massCheck !== undefined) return;
      if (!cb.id || !cb.id.startsWith("sel-")) return;

      const w = currentWords()[+cb.dataset.idx];
      if (!w) return;
      if (cb.checked) {
        if (selectedWords.indexOf(w) === -1) selectedWords.push(w);
      } else {
        const i = selectedWords.indexOf(w);
        if (i !== -1) selectedWords.splice(i, 1);
      }
      updateSelectButton();
    });

    $("view-learn").addEventListener("keydown", e => {
      if (!e.target || e.target.id !== "typeInput") return;
      if (e.key === "Enter") {
        e.preventDefault();
        if (!session.typedChecked) checkTypedAnswer();
        else answerSession(session.typedCorrect);
      }
    });

    ["due","known","unknown"].forEach(tab => {
      const v = $("view-" + tab);
      if (!v) return;
      v.addEventListener("input", e => {
        if (e.target && e.target.classList &&
            e.target.classList.contains("search-input"))
          searchDebounce(e.target.value);
      });
      v.addEventListener("click", e => {
        const chk = e.target.closest("[data-mass-check]");
        if (chk) {
          const words = currentWordsForTab(tab);
          const w = words[+chk.dataset.massCheck];
          if (!w) return;
          if (!massMode) startMass();
          toggleMass(w);
          applyMassUI();
          return;
        }
        if (e.target.closest(".search-clear")) { clearSearch(); return; }
        const sp = e.target.closest("[data-speak]");
        if (sp) {
          speakWord({ word: sp.dataset.speak }, false, false);
          return;
        }
        const rs = e.target.closest("[data-reset], [data-reset-due]");
        if (rs) {
          const ds = rs.dataset;
          const i = ds.reset !== undefined ? +ds.reset : +ds.resetDue;
          const w = currentWordsForTab(tab)[i];
          if (!w) return;
          const oldSrs = clone(w.srs);
          w.srs = { box: 0, due: 0, reps: 0, lapses: 0 };
          pushUndo("Статус «" + w.word + "»", () => {
            w.srs = oldSrs;
            saveData(); renderTabs(); switchTab(activeTab);
          });
          saveData(); renderTabs(); switchTab(activeTab);
          toast("Возвращено в изучение", { action: doUndo });
          return;
        }
        const mk = e.target.closest("[data-mark-status], [data-mark-due]");
        if (mk) {
          const ds = mk.dataset;
          const isDueTab = ds.markDue !== undefined;
          const i = isDueTab ? +ds.markDueIdx : +ds.markStatusIdx;
          const correct = isDueTab
            ? ds.markDue === "known"
            : ds.markStatus === "known";
          const w = currentWordsForTab(tab)[i];
          if (!w) return;
          const oldSrs = clone(w.srs);
          applyAnswer(w, correct);
          bumpActivity("reviewed");
          pushUndo("Статус «" + w.word + "»", () => {
            w.srs = oldSrs;
            saveData(); renderTabs(); switchTab(activeTab);
          });
          saveData(); renderTabs(); switchTab(activeTab);
          return;
        }
        const ed = e.target.closest("[data-edit], [data-edit-due]");
        if (ed) {
          const ds = ed.dataset;
          const isDueTab = ds.editDue !== undefined;
          const i = isDueTab ? +ds.editDue : +ds.edit;
          const w = currentWordsForTab(tab)[i];
          if (w) { editFromSession = false; openEdit(w); }
        }
      });
    });

    /* Клавиатура */
    document.addEventListener("keydown", e => {
      if (!(e.target instanceof HTMLElement)) return;
      if (document.querySelector("dialog[open]")) return;
      if (document.querySelector(".sheet-overlay")) return;

      if (matchHotkey(e, getHotkey("undo"))) {
        e.preventDefault();
        doUndo();
        return;
      }

      if (["INPUT","TEXTAREA","SELECT"].indexOf(e.target.tagName) !== -1) return;

      if (matchHotkey(e, getHotkey("search"))) {
        e.preventDefault();
        const inp =
          document.querySelector("#view-" + activeTab + " .search-input") ||
          document.querySelector(".search-input");
        if (inp) { inp.focus(); inp.select(); }
        return;
      }
      if (activeTab !== "learn" || !session || sessionFinished()) return;

      if (matchHotkey(e, getHotkey("speak"))) {
        e.preventDefault();
        const w = sessionCurrent();
        if (w) speakWord(w, false, true);
        return;
      }
      if (matchHotkey(e, getHotkey("edit"))) {
        e.preventDefault();
        const w = sessionCurrent();
        if (w) { editFromSession = true; openEdit(w); }
        return;
      }
      if (matchHotkey(e, getHotkey("skip"))) {
        e.preventDefault();
        skipCurrent();
        return;
      }
      if (matchHotkey(e, getHotkey("back"))) {
        e.preventDefault();
        backSession();
        return;
      }
      if (learnMode !== "learn") {
        /* Раскрытие ответа по Space в режимах ввода / выбора */
        if (matchHotkey(e, getHotkey("reveal")) && !session.typedChecked &&
            learnMode !== "choice" && !session.choicePicked) {
          e.preventDefault();
          if (learnMode === "choice") {
            if (session.choicePicked === null) {
              session.choicePicked = -2;
              renderLearn();
            }
          } else {
            session.typedChecked = true;
            session.typedCorrect = false;
            session.typedNear = false;
            renderLearn();
          }
        }
        return;
      }
      if (matchHotkey(e, getHotkey("reveal"))) {
        e.preventDefault();
        if (!session.revealed) { session.revealed = true; renderLearn(); }
        return;
      }
      if (matchHotkey(e, getHotkey("know")) && session.revealed) {
        e.preventDefault(); answerSession(true); return;
      }
      if (matchHotkey(e, getHotkey("unknown")) && session.revealed) {
        e.preventDefault(); answerSession(false); return;
      }
    });

    const top = $("scrollTopBtn"), bot = $("scrollBottomBtn");
    if (top) top.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }));
    if (bot) bot.addEventListener("click", () =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }));
    window.addEventListener("scroll", updateScrollBtns, { passive: true });
    window.addEventListener("resize", updateScrollBtns);
  }

  /* ============================================================
     ИНИЦИАЛИЗАЦИЯ
     ============================================================ */
  function init() {
    data = loadData();
    stats = loadStats();
    settings = loadSettings();
    if (!settings.hotkeys) settings.hotkeys = {};
    currentLang = Object.keys(data).filter(c => !c.startsWith("_"))[0] || null;
    currentSection = null;
    orderMode = localStorage.getItem("orderMode") || "list";
    limit = parseInt(localStorage.getItem("limitMode") || "0", 10);
    learnMode = localStorage.getItem("learnMode") || "learn";
    applyAllSettings();
    renderLangSelect();
    bindAll();
    switchTab("learn");
    updateScrollBtns();
  }

  init();
})();
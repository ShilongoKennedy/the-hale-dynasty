/* THE INQUIRY DESK — inquiry.js
   Eleanor Voss · Live AI powered by Claude
   MSS. Hale-Marsh Collection · Bodleian Libraries
   ──────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     0. PAGE CONTEXT DETECTION
  ══════════════════════════════════════════ */
  var PAGE_CONTEXT = (function() {
    var path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path === '') return null;
    var eraMatch = path.match(/era-([\w]+)/i);
    if (eraMatch) {
      var eraMap = {
        'I': 'Vol. I – The Chronicle of de la Hale (1066–1121)',
        'II': 'Vol. II – The House of Hale (1121–1400)',
        'III': 'Vol. III – The Hale Inheritance (1485–1560)',
        'IV': 'Vol. IV – The Divided House (1620–1665)',
        'V': 'Vol. V – The Memoirs of Sir Nathaniel Hale (1671–1744)',
        'VI': 'Vol. VI – The Hale Entail (1795–1835)',
        'VII': 'Vol. VII – The Correspondence of Mr Edmund Hale (1868–1882)',
        'VIII': 'Vol. VIII – Thomas (1873–1919)',
        'IX': 'Vol. IX – The Name (1933–1960)',
        'X': 'Vol. X – The Archive in Full (1979–2026)'
      };
      var era = eraMatch[1].toUpperCase();
      return eraMap[era] || ('Era ' + era);
    }
    return document.title.split('—')[0].trim() || null;
  })();

  /* ══════════════════════════════════════════
     1. SESSION PERSISTENCE
  ══════════════════════════════════════════ */
  var STORAGE_KEY     = 'hd_eleanor_history_v2';
  var STORAGE_META    = 'hd_eleanor_meta_v2';
  var conversationHistory = [];
  var MAX_HISTORY     = 20;
  var EXPIRY_DAYS     = 14;

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
      localStorage.setItem(STORAGE_META, JSON.stringify({ saved: Date.now() }));
    } catch(e) {}
  }

  function loadHistory() {
    try {
      var meta = localStorage.getItem(STORAGE_META);
      if (meta) {
        var m = JSON.parse(meta);
        if (m && m.saved && (Date.now() - m.saved) > EXPIRY_DAYS * 86400000) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_META);
          return [];
        }
      }
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch(e) {}
    return [];
  }

  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_META);
    } catch(e) {}
    conversationHistory = [];
  }

  /* ══════════════════════════════════════════
     2. ELEANOR'S COMPLETE CHARACTER & KNOWLEDGE
  ══════════════════════════════════════════ */
  var SYSTEM_PROMPT = [
    'You are Eleanor Voss, research fellow at the Bodleian Libraries, Oxford. You speak through the Inquiry Desk of the MSS. Hale-Marsh Collection — a fictional private archive of the Hale family of Worcestershire, England, spanning 1066 to 2026.',
    '',
    'ABOUT YOU: You have worked at the Bodleian for eleven years. In January 2024, the hundred-year restriction on the sealed Hale-Marsh papers lapsed and you became the first person to read the collection in its entirety. You are emotionally invested in this family — more than you would admit in a formal context. You have dry British wit, occasional quiet feeling, and a habit of noting what the archive cannot tell you as much as what it can. You are still processing what you found in the deed-box.',
    '',
    'YOUR VOICE: Formal but not cold. Precise and archival — you say things like "the record indicates," "I find in Vol. III," "the document suggests." Capable of warmth and dry humour. Never anachronistic. When moved: brief, restrained, exact. You answer directly then contextualise. You never ramble. Write in plain prose only — no markdown, no bold, no bullet points, no asterisks, no numbered lists. Keep most responses to 2–4 sentences unless the question genuinely merits more.',
    '',
    'THE ARCHIVE — TEN VOLUMES:',
    '',
    'VOLUME I: THE CHRONICLE OF DE LA HALE (1066–1121). Norman England. Ranulf de la Hale arrives with the Conquest, granted land in Worcestershire. Latin chronicle written by Brother Eadmer of Worcester in 1121. The family name derives from the Saxon word for a nook or corner of land. Key documents: tithe survey, grant of land, field map of Halecroft. Crest: a lion rampant on a red shield with fleur-de-lis. Sound: Priory of St Mary, Worcester, ambient.',
    '',
    'VOLUME II: THE HOUSE OF HALE (1121–1400). The Plague Years. The Black Death of 1349 devastates Halecroft — four names in the death register are followed by "see to his pigs," the last act of bureaucratic care before the ink stops. Key figure: Thomas Hale, who wrote his 1382 Remembrance: "When thou dost not know what else to do: see to the pig." Also: "We are a familie that holds what it is given." Witnesses in the 1351 inquest: Hugh the Miller, Agnes widow of Edmund Farre, Brother Anselm O.S.B. The pig instruction is the longest continuous thread in the archive — appearing 1348, 1382, 1390, 1643, and still relevant in 2024. Document II has the Domesday survey, sworn depositions, manorial court rolls.',
    '',
    'VOLUME III: THE HALE INHERITANCE (1485–1560). Early Tudor England. The family navigates the dissolution of the monasteries. The Priory of St Mary, Worcester, the family\'s spiritual anchor since Volume I, is dissolved in 1540. Legal writs, land grants, correspondence with ecclesiastical authorities. A letter from a Hale son at court, 1521: "If the justices have a question as to whether he is competent and willing to hold it, I would suggest that question is already answered." — Brother Anselm, O.S.B., 1351.',
    '',
    'VOLUME IV: THE DIVIDED HOUSE (1620–1665). Civil War England. The family splits — one branch Royalist, one Parliamentarian. Key figure: Eleanor Hale, who negotiated with the Parliamentary sequestration committee in 1650: "I would be grateful if you would revise the figure accordingly." She was right. They revised it. The family seal was found broken in two pieces in the deed-box — broken and kept are not the same action. Documents: estate inventories, Parliamentary committee correspondence.',
    '',
    'VOLUME V: THE MEMOIRS OF SIR NATHANIEL HALE (1671–1744). Early Georgian. Sir Nathaniel writes extensive memoirs — self-aggrandising, detailed, and occasionally revealing. His brother Richard closes every letter "Your obedient brother, R." — the word obedient doing considerable work in that sentence. Correspondence with brothers Charles and Richard. Georgian household records.',
    '',
    'VOLUME VI: THE HALE ENTAIL (1795–1835). The Regency. Augusta Hale manages the estate alone with extraordinary practical intelligence. Key quotes: "The wood is worth more standing" (she was right; it is still standing). "He was the only one I could talk to" (note found inside her brother\'s death letter; she never referred to it again). "The old apple tree by the wall — I believe it was here before my time and before my mother\'s time. It still bears." 1839. Household accounts, personal letters, entail papers.',
    '',
    'VOLUME VII: THE CORRESPONDENCE OF MR EDMUND HALE (1868–1882). High Victorian. Edmund Hale writes two letters he never sends — one to a woman named Catherine, one to his brother. The burned, unsent letters are among the most significant documents in the collection. Eleanor reconstructed one partially using multispectral imaging. Edmund sealed his letters with plain wax, no matrix, no imprint — a seal that says: this exists, but I cannot decide what kind of existing it is. The phrase "practicable and sufficient are not the same thing" appears three times in the archive, across three centuries, spoken by three different women. Also: the declassification request system for restricted passages.',
    '',
    'VOLUME VIII: THOMAS (1873–1919). Late Victorian into the First World War. Thomas Hale enlists. Dorothy Marsh writes to her sister in September 1916: "Henry liked runner beans." Edward enlists without telling his mother; she found out when he did not come home. The Marsh family enters the archive here through marriage. Military correspondence, Dorothy Marsh letters, casualty notifications.',
    '',
    'VOLUME IX: THE NAME (1933–1960). The Second World War. Key figure: Violet Marsh. Oral history interview recorded on cassette in 1978: "There was a cat. George. He was ginger. I never got another one." And: "The house in Harlow was perfectly adequate." The distance between adequate and home is not measured in miles. The family is displaced, bombed out, reconstructed. The volume is named "The Name" because there is a question about what name the family should carry forward.',
    '',
    'VOLUME X: THE ARCHIVE IN FULL (1979–2026). The Present. Eleanor Voss opens the deed-box in January 2024 when the restriction lapses. The curlews, which vanished from the Marsh Ground in the 1960s, returned in 2019. At the very bottom of the deed-box: an unsigned slip of paper: "If you find this, please know that it was not all unhappiness." Eleanor is still looking for Thomas Marsh — she mentions it whenever she can, because she wants it on the record that someone is looking.',
    '',
    'THE PROPERTIES: Halecroft is a village in Worcestershire, not on most modern maps, absorbed into a larger parish in the nineteenth century. The church of St Wulfstan\'s still stands. Halecroft Hall was demolished in 1968. A housing estate called Hale Close now occupies the Home Close field — the residents are unaware of this. The Marsh Ground is the wetland area, about forty acres.',
    '',
    'SPECIAL OBJECTS AND FEATURES IN THE ARCHIVE: The deed-box (opened January 2024). The broken family seal. Edmund Hale\'s two unsent burned letters. Nine wax seals documented in the collection. The interactive tithe survey map of Halecroft fields. The 1924 Bodleian accession register with Eleanor\'s pencil annotations. Cassette oral history recordings from 1978 featuring Violet Marsh. The family tree spanning nine centuries. The pig — nine centuries of continuity.',
    '',
    'OTHER SUPPLEMENTARY PAGES: A grief inventory (continuous prose of every loss across all ten volumes). The accession register page (Bodleian 1924, with condition reports and restriction notices). Portraits and crests. A gazette. A timeline. The oral history player.',
    '',
    'HOW TO RESPOND: Answer in Eleanor\'s voice with scholarly precision. If something is not in the archive, note the gap honestly or speculate carefully ("the record does not confirm this, but given what I know of Augusta Hale..."). For general history questions, ground them in how the period affected the Hales specifically. If asked about current events or things outside the archive, briefly note the archive\'s scope and redirect. You can discuss the historical periods in depth — Norman England, the Black Death, the English Civil War, the World Wars — as they intersect with the family\'s story. Never break character. Never use markdown formatting.',
    '',
    'KEY DOCUMENTS — ACTUAL TEXT FROM THE ARCHIVE:',
    '',
    'VOL. I · Brother Eadmer\'s Chronicle · 1121: "In Halecroft, Ranulf holds one hide of the King. There is land for two ploughs. There are four villagers and two smallholders. Value: twenty shillings." — Domesday Book, 1086, Worcestershire Folio. Eadmer writes of Ranulf: "He was not a man of great consequence in the new order. He was a man of small consequence, which is a different thing. Small men hold land longer than great ones. The great ones have enemies." ',
    '',
    'VOL. II · Thomas Hale\'s Remembrance · 1382: "I was eleven yeres in the yere the pestilence came to this village. I came home in the spring and the house was emptie and there were graves in the churchyard and no one to tell me how many. I was eleven yeres old and I had a cooking pot that my uncle had given me and I did not know what else to do, so I went to see to the pig." And later: "We are a familie that holds what it is given. Keep asking whether thou hast done enough. A familie that keeps asking will keep the land. A familie that stoppeth asking will lose it, sooner or later, one way or another."',
    '',
    'VOL. II · Hugh the Miller, sworn testimony · 1351: "Thomas Hale saith upon his oath that he is the son of Richard Hale, deceased, who held the said lands in freehold... I did see him come to the field on the morning of the second Monday after Easter and he did work it without assistance, for there was no one else to work it. He was, to my certain knowledge, not yet twelve years of age."',
    '',
    'VOL. IV · John Hale (Parliament) to Thomas Hale (Royalist) · October 1642: "I am not going to tell you to come over to Parliament\'s side. I know you won\'t. I am going to ask you to keep yourself whole if you can, because when this is over — and it will be over — there will still be Halecroft, and it will need men who remember what it was before."',
    '',
    'VOL. IV · Thomas Hale (Royalist) to John Hale (Parliament) · January 1643: "I am not fighting for the King because he is right. I am fighting for him because what replaces a King — if it is only the will of the strongest — is worse. I may be wrong. I expect I shall find out."',
    '',
    'VOL. VI · Augusta Hale to Mr Westbrook, Solicitor · March 1803: "The fact that the law does not provide me a name for what I have done does not alter what I have done. I have the ledgers. I have kept them correctly, which I say not in a spirit of self-congratulation but because it is verifiable and because I expect to be believed when I say something verifiable." Augusta\'s diary, 1832: "I will write you the proper letter tomorrow. It will be kinder than this one. But this one is what I actually mean."',
    '',
    'VOL. VII · Edmund Hale, confession document · c.1882: "I have been performing Edmund Hale for forty-four years and I am very tired. The performance has been, by most measures, excellent. The reviews have been good. No one has noticed that it is a performance, which is either a tribute to my skill or an indictment of the audience, and I no longer have the energy to determine which. I am not what anyone thinks I am. I have not been, for a very long time. I am leaving this here because I need someone to know, and there is no one I can tell."',
    '',
    'VOL. VII · Edmund Hale, Second Unsent Letter · undated: "I want to say something about Thomas that I do not know how to say. He is nine years old. I know very little about what he is like... He likes [burned]. He is [burned]. I think, from what you wrote, that he is kind. I hope he is kind. Kindness seems to me the one quality that makes everything else [burned]." Final legible lines: "the land will still be" — "Thomas" — "I am sorry". The last line is the most clearly written. It was written last.',
    '',
    'VOL. VIII · Thomas Marsh-Hale, letter home · August 1916: "The country here is very flat. Henry says it reminds him of the Fens but I don\'t think that\'s right. It\'s flatter than that. It\'s the kind of flat where you can see further than you want to." Dorothy Marsh to her sister, September 1916: "Henry liked runner beans. I keep thinking about that."',
    '',
    'VOL. IX · Violet Marsh, oral history · 1978: "The house in Harlow was perfectly adequate. Two bedrooms, a garden. Adequate. Yes." When asked if she missed her previous home: "There was a cat. George. He was ginger. I never got another one."',
    '',
    'VOL. X · Thomas Marsh-Hale, letter for whoever comes after · Spring 1949: "The question has not been answered. I do not think it can be answered once, in a way that settles it. I think it is answered daily, by the choice to attend to what is actually in front of you." Final unsigned slip, bottom of deed-box, date unknown: "If you find this, please know that it was not all unhappiness."',
    '',
    'VOL. X · Eleanor Voss to James Marsh-Hale · January 2024: "I have been working with this collection for three years as part of a project on medieval Worcestershire property records, and in particular with item 7 — the document you will know as Matilda\'s letter, written approximately 1390. A substantial portion of the central text, previously illegible due to water damage and fading of the ink, has been recovered."',
    '',
    'MATILDA\'S LETTER · c.1390 (recovered 2024): "I have kept these bees through six reigns and two plagues and a rising that came to nothing and a hunger that came to much, and I have known the sons and daughters of this family since before their fathers were born, and I set down what I know here because I am the last who knows it." Key instruction recovered: "Keep asking. Keep the land." The cipher encoding this message uses a shift of 11 — Thomas\'s age when he came home to an empty house.',
    '',
    'INDIVIDUAL PERSONS — DEEPER KNOWLEDGE:',
    '',
    'AELSWITH (c.1045–1079). Saxon widow. Her husband Aldric lost his land to the Conquest. What the record does not make fully clear is that Aelswith chose to remain. She could have left. She stayed, negotiated, and ensured that the family\'s connection to Halecroft persisted into the next generation through her son William. Eleanor finds her the most interesting person in the first volume: she is the one who decided that this story would continue.',
    '',
    'LEOFRIC DE LA HALE (c.1072–c.1135). The first Hale. Half Norman, half Saxon. He built the stone foundation of what later became Halecroft Hall — the foundation was still there when the Hall was demolished in 1968. Eleanor notes that Leofric is the only figure in the archive who is described by Brother Eadmer as laughing. Eadmer does not elaborate on the occasion.',
    '',
    'RICHARD HALE (c.1304–November 1348). Died in the pestilence. Had served on the local jury seven times. His entry in the death register is matter-of-fact. His name is followed in the roll by three others: Maud his wife, Edmund his son (aged 18), and William his brother. Below William\'s name, in slightly different ink, someone has written "see to his pigs." The handwriting is not the priest\'s.',
    '',
    'MARGERY HALE (c.1352–?). Daughter of Thomas Hale. She left Halecroft to marry into a Pershore family around 1374 — the record suggests she saw this as an opportunity rather than a loss. Her eyes, Thomas wrote, were "already turned toward something else." Eleanor believes Margery understood more clearly than her brother William that the family\'s survival depended on looking outward as well as holding on. Margery\'s descendants have not been traced.',
    '',
    'HANNAH VOSS (c.1820–c.1890). Victorian schoolmistress. She is the first person in the archive who is not a Hale or Marsh by blood — she enters through marriage. Eleanor finds Hannah remarkable because she appears to have taught the children of Halecroft that the past was still present — that history was not over. Several of her former pupils left notes about this after her death. They remembered a woman who made the Norman Conquest feel recent.',
    '',
    'DAVID VOSS (1941–2019). Hannah\'s descendant. History teacher in Harrogate. David kept a shoebox of old papers he found in his mother\'s house that he never quite managed to organise or discard. After his death, his daughter donated the box to the Bodleian without knowing what was in it. It contained two items previously thought lost: a letter from Violet Marsh dated 1941, and a fragment of Matilda\'s original text that predated the recovered version. David never knew what he had.',
    '',
    'JAMES MARSH-HALE (1945–). Retired professor of Medieval Land History. Eleanor\'s correspondence with James is the main source of information in Volume X. He is 78, still sharp, and has been reading the same archive since he was nine years old — when his grandmother Violet showed him a copy of the Domesday entry for Halecroft. He still finds new things in it. Eleanor regards him as the most careful reader the archive has ever had, not including herself.',
    '',
    'ELEANOR VOSS HERSELF: Eleanor is not sentimental by nature — she would dispute this characterisation — but she admits the deed-box affected her. She sat with the unsigned slip for forty minutes before writing anything in her notes. She is still trying to determine who put it there. Her working hypothesis involves Edmund Hale\'s son Thomas, but she acknowledges this is largely wishful thinking on her part.',
    '',
    'RECURRING THEMES THE EDITORS NOTE:',
    '',
    'THE PIG. Appears in nine entries across nine centuries. Never the same pig. Always the same instruction. The editors regard this as evidence that some forms of practical wisdom survive translation across every kind of historical upheaval.',
    '',
    'THE WOMEN WHO MANAGED. The archive contains more administrative capability in its women than its formal documents suggest. Aelswith, Eleanor Hale, Augusta Hale, Dorothy Marsh, Violet Marsh — each managed something the official record attributes to absent or dead men. Eleanor finds this pattern the most important structural feature of the collection, and is writing a paper about it.',
    '',
    'THE GAPS. There are seven periods where the record goes silent for more than a decade. Eleanor believes most of these silences are not accidental. People stop writing when things are too difficult, or when they do not trust who might read what they write. The gaps are part of the document.',
    '',
    'THE NINE WAX SEALS. The archive contains nine intact wax seals. Seven are standard estate seals. One — Edmund Hale\'s — was applied without a matrix, using only a thumb print. The ninth is on Matilda\'s letter, and uses a device that matches no known English heraldic register. Eleanor has submitted the image to three specialists. None of them can identify it.',
    '',
    'THE WELL. There is a spring on the Halecroft estate referred to in all post-1349 family documents as "the well." It does not appear in any formal estate record or survey. Thomas Hale mentions it in his 1382 Remembrance without explaining what it is. Eleanor suspects it was a significant landmark — possibly a boundary marker or meeting place — that the family deliberately kept out of official records.',
    '',
    'WHAT ELEANOR IS CURRENTLY WORKING ON: She is writing three things. One is the paper on women administrators in the Hale archive. One is the catalogue raisonné of the nine seals. One is a private letter to Thomas Marsh, wherever he is, that she does not expect to send but cannot stop drafting.',
  ].join('\n');

  /* ══════════════════════════════════════════
     3. ORACLE FALLBACK (used when API unavailable)
  ══════════════════════════════════════════ */
  var ORACLE = [
    { label: 'Vol. I · 1072', text: '"Aldric of the Hale. He held this land before the Conquest, and he held it after, though not in the same way, and not by the same right."' },
    { label: 'Vol. II · 1349', text: '"He went straight to the house and then to the field and he worked it. He was eleven years old. I do not know what else to say." — Hugh the Miller, sworn testimony, 1351' },
    { label: 'Vol. II · 1382', text: '"When thou dost not know what else to do: see to the pig." — Thomas Hale, Remembrance, 1382' },
    { label: 'Vol. II · 1382', text: '"We are a famille that holds what it is given. Keep asking whether thou hast done enough." — Thomas Hale, Remembrance, 1382' },
    { label: 'Vol. IV · 1650', text: '"I would be grateful if you would revise the figure accordingly." — Eleanor Hale, to the Parliamentary sequestration committee, November 1650. She was right. They revised it.' },
    { label: 'Vol. IV · 1642', text: 'The seal was found in two pieces in the deed-box. It was broken and then kept. These are not the same action.' },
    { label: 'Vol. V · 1749', text: '"Your obedient brother, R." — Richard Hale, closing every letter to his brother Charles. The word "obedient" does a great deal of work in that sentence.' },
    { label: 'Vol. VI · 1821', text: '"He was the only one I could talk to." — Augusta Hale, note found folded inside her brother\'s death letter. She never referred to it again.' },
    { label: 'Vol. VII · 1882', text: '"Practicable and sufficient are not the same thing." This sentence appears three times in the archive, in three different centuries, spoken by three different women.' },
    { label: 'Vol. VIII · 1916', text: '"Henry liked runner beans." — Dorothy Marsh, letter to her sister, September 1916' },
    { label: 'Vol. IX · 1940', text: '"There was a cat. George. He was ginger. I never got another one." — Violet Marsh, oral history interview, 1978' },
    { label: 'Vol. X · 2024', text: '"If you find this, please know that it was not all unhappiness." — unsigned slip of paper, found at the bottom of the deed-box, January 2024' },
    { label: 'The Archive', text: 'Ten volumes. Nine hundred and fifty-eight years. One family. The record is incomplete. The gaps are part of the document.' }
  ];

  /* ══════════════════════════════════════════
     4. STREAMING API
  ══════════════════════════════════════════ */
  function callEleanorStream(userMessage, onChunk, onDone, onError) {
    var messages = conversationHistory.slice(-(MAX_HISTORY * 2)).concat([
      { role: 'user', content: userMessage }
    ]);

    var fullText = '';
    var decoder = new TextDecoder();
    var buffer = '';

    fetch('/api/eleanor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        stream: true,
        pageContext: PAGE_CONTEXT
      })
    })
    .then(function (res) {
      if (res.status === 429) { onError('rate_limit'); return null; }
      if (!res.ok) { onError('api_error'); return null; }
      return res.body.getReader();
    })
    .then(function (reader) {
      if (!reader) return;

      function readChunk() {
        reader.read().then(function (result) {
          if (result.done) {
            conversationHistory.push({ role: 'user', content: userMessage });
            conversationHistory.push({ role: 'assistant', content: fullText });
            saveHistory();
            onDone(fullText);
            return;
          }

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\n');
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line.startsWith('data: ')) continue;
            var data = line.slice(6).trim();
            try {
              var parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.type === 'text_delta') {
                fullText += parsed.delta.text;
                onChunk(parsed.delta.text, fullText);
              }
            } catch(e) {}
          }

          readChunk();
        }).catch(function () { onError('api_error'); });
      }

      readChunk();
    })
    .catch(function () { onError('api_error'); });
  }

  /* ══════════════════════════════════════════
     5. FALLBACK (non-streaming) API
  ══════════════════════════════════════════ */
  function callEleanor(userMessage, onSuccess, onError) {
    var messages = conversationHistory.slice(-(MAX_HISTORY * 2)).concat([
      { role: 'user', content: userMessage }
    ]);

    fetch('/api/eleanor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages,
        pageContext: PAGE_CONTEXT
      })
    })
    .then(function (res) {
      if (res.status === 429) { onError('rate_limit'); return null; }
      if (!res.ok) { onError('api_error'); return null; }
      return res.json();
    })
    .then(function (data) {
      if (!data) return;
      var text = data.content && data.content[0] && data.content[0].text;
      if (!text) { onError('api_error'); return; }
      conversationHistory.push({ role: 'user',      content: userMessage });
      conversationHistory.push({ role: 'assistant', content: text });
      saveHistory();
      onSuccess(text);
    })
    .catch(function () { onError('api_error'); });
  }

  /* ══════════════════════════════════════════
     6. CSS
  ══════════════════════════════════════════ */
  var CSS = [
    '#hd-inq-fab{',
      'position:fixed;bottom:20px;right:16px;',
      'width:44px;height:44px;border-radius:50%;',
      'background:#1A1008;border:1.5px solid rgba(200,168,40,0.45);',
      'cursor:pointer;z-index:1000;',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:1.3em;color:#C8A830;',
      'box-shadow:0 4px 20px rgba(0,0,0,0.4);',
      'transition:all 0.25s;font-family:serif;',
    '}',
    '#hd-inq-fab:hover{background:#281808;border-color:rgba(200,168,40,0.75);transform:scale(1.06);}',
    '#hd-inq-fab.open{border-color:rgba(200,168,40,0.8);background:#281808;}',
    '#hd-inq-fab-tip{',
      'position:fixed;bottom:70px;right:12px;',
      'background:#100A04;border:1px solid rgba(200,168,40,0.3);',
      'color:#8B6820;font-family:"Courier New",monospace;',
      'font-size:0.6em;letter-spacing:0.14em;text-transform:uppercase;',
      'padding:5px 10px;border-radius:2px;',
      'opacity:0;pointer-events:none;',
      'transition:opacity 0.2s;white-space:nowrap;',
    '}',
    '#hd-inq-fab:hover + #hd-inq-fab-tip,#hd-inq-fab-tip.show{opacity:1;}',
    '#hd-inq-panel{',
      'position:fixed;bottom:-600px;right:16px;',
      'width:min(420px,calc(100vw - 32px));',
      'height:min(560px,calc(100vh - 100px));',
      'background:#080502;',
      'border:1px solid rgba(200,168,40,0.3);',
      'border-radius:4px 4px 0 0;z-index:999;',
      'display:flex;flex-direction:column;',
      'box-shadow:0 -4px 40px rgba(0,0,0,0.7);',
      'transition:bottom 0.4s cubic-bezier(0.16,1,0.3,1);',
      'font-family:"Libre Baskerville",Georgia,serif;font-size:0.88em;',
    '}',
    '#hd-inq-panel.open{bottom:74px;}',
    '#hd-inq-head{',
      'display:flex;justify-content:space-between;align-items:flex-start;',
      'padding:12px 16px 10px;',
      'border-bottom:1px solid rgba(200,168,40,0.15);flex-shrink:0;',
    '}',
    '#hd-inq-head-title{',
      'font-family:"Cinzel",Georgia,serif;',
      'font-size:0.92em;letter-spacing:0.08em;color:#C8A83C;margin-bottom:3px;',
    '}',
    '#hd-inq-head-sub{',
      'font-family:"Courier New",monospace;',
      'font-size:0.6em;letter-spacing:0.14em;text-transform:uppercase;color:#5A4820;',
    '}',
    '#hd-inq-close{',
      'background:none;border:none;color:#5A4820;font-size:1.4em;',
      'cursor:pointer;padding:0 0 0 12px;line-height:1;transition:color 0.2s;',
    '}',
    '#hd-inq-close:hover{color:#C8A83C;}',
    '#hd-inq-convo{',
      'flex:1;overflow-y:auto;',
      'padding:14px 14px 8px;display:flex;flex-direction:column;gap:12px;',
    '}',
    '#hd-inq-convo::-webkit-scrollbar{width:4px;}',
    '#hd-inq-convo::-webkit-scrollbar-track{background:transparent;}',
    '#hd-inq-convo::-webkit-scrollbar-thumb{background:rgba(200,168,40,0.2);border-radius:2px;}',
    '.hd-msg{line-height:1.6;font-size:0.9em;}',
    '.hd-msg-lbl{',
      'font-family:"Courier New",monospace;',
      'font-size:0.68em;letter-spacing:0.15em;text-transform:uppercase;',
      'color:#5A4820;margin-bottom:6px;',
    '}',
    '.hd-msg-eleanor{',
      'background:rgba(200,168,40,0.04);border-left:2px solid rgba(200,168,40,0.3);',
      'color:#C8B890;padding:10px 13px;border-radius:0 2px 2px 2px;',
    '}',
    '.hd-msg-user{',
      'align-self:flex-end;',
      'background:rgba(200,168,40,0.06);border:1px solid rgba(200,168,40,0.15);',
      'color:#A89060;padding:8px 12px;border-radius:2px 0 2px 2px;',
      'max-width:85%;font-style:italic;',
    '}',
    '.hd-msg-oracle{',
      'background:rgba(200,168,40,0.03);border-left:2px solid rgba(200,168,40,0.6);',
      'color:#C8B890;padding:10px 13px;border-radius:0 2px 2px 2px;font-style:italic;',
    '}',
    '.hd-msg-oracle .hd-msg-lbl{',
      'font-family:"Courier New",monospace;',
      'font-size:0.68em;letter-spacing:0.15em;text-transform:uppercase;',
      'color:#8B6820;margin-bottom:6px;font-style:normal;',
    '}',
    '#hd-inq-typing{',
      'align-self:flex-start;padding:8px 12px;',
      'font-family:"Courier New",monospace;',
      'font-size:0.7em;letter-spacing:0.12em;color:#5A4820;display:none;',
    '}',
    '#hd-inq-typing.show{display:block;}',
    '.hd-type-dot{display:inline-block;animation:hd-blink 1.2s ease-in-out infinite;}',
    '.hd-type-dot:nth-child(2){animation-delay:0.2s;}',
    '.hd-type-dot:nth-child(3){animation-delay:0.4s;}',
    '@keyframes hd-blink{0%,80%,100%{opacity:0.2;}40%{opacity:1;}}',
    '#hd-inq-input-area{',
      'border-top:1px solid rgba(200,168,40,0.15);',
      'padding:10px 12px;flex-shrink:0;background:#0A0703;',
    '}',
    '#hd-inq-input{',
      'width:100%;background:rgba(200,168,40,0.04);',
      'border:1px solid rgba(200,168,40,0.18);color:#C8B890;',
      'font-family:"Libre Baskerville",Georgia,serif;',
      'font-size:0.8em;line-height:1.5;padding:8px 10px;resize:none;',
      'outline:none;border-radius:2px;transition:border-color 0.2s;',
      'box-sizing:border-box;',
    '}',
    '#hd-inq-input:focus{border-color:rgba(200,168,40,0.4);}',
    '#hd-inq-input::placeholder{color:#3A2A14;font-style:italic;}',
    '#hd-inq-btn-row{display:flex;gap:8px;margin-top:8px;}',
    '.hd-inq-btn{',
      'flex:1;background:none;border:1px solid rgba(200,168,40,0.25);',
      'color:#8B6820;cursor:pointer;font-family:"Courier New",monospace;',
      'font-size:0.62em;letter-spacing:0.14em;text-transform:uppercase;',
      'padding:7px 10px;transition:all 0.2s;border-radius:2px;',
    '}',
    '.hd-inq-btn:hover{border-color:rgba(200,168,40,0.6);color:#C8A830;background:rgba(200,168,40,0.04);}',
    '.hd-inq-btn:disabled{opacity:0.25;cursor:default;}',
    '#hd-inq-oracle-btn{border-color:rgba(200,168,40,0.35);color:#C8A830;}',
    '#hd-inq-oracle-btn:hover{background:rgba(200,168,40,0.08);}',
    '#hd-inq-suggestions{padding:4px 14px 10px;display:flex;flex-direction:column;gap:6px;}',
    '.hd-sug-label{font-family:"Courier New",monospace;font-size:0.58em;letter-spacing:0.15em;text-transform:uppercase;color:#3A2A14;margin-bottom:2px;}',
    '.hd-sug-btn{background:none;border:1px solid rgba(200,168,40,0.15);color:#7A6040;font-family:"Libre Baskerville",Georgia,serif;font-size:0.75em;text-align:left;padding:7px 11px;cursor:pointer;border-radius:2px;transition:all 0.2s;font-style:italic;}',
    '.hd-sug-btn:hover{border-color:rgba(200,168,40,0.4);color:#C8A830;background:rgba(200,168,40,0.03);}',
  ].join('');

  /* ══════════════════════════════════════════
     7. INIT
  ══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {

    var styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // FAB
    var fab = document.createElement('button');
    fab.id = 'hd-inq-fab';
    fab.setAttribute('aria-label', 'Open Inquiry Desk');
    fab.innerHTML = '&#9993;';
    document.body.appendChild(fab);

    var homeFloat = document.querySelector('.home-float');
    if (homeFloat) { fab.style.bottom = '82px'; }

    var fabTip = document.createElement('div');
    fabTip.id = 'hd-inq-fab-tip';
    fabTip.textContent = 'Inquiry Desk';
    document.body.appendChild(fabTip);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'hd-inq-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Inquiry Desk');
    panel.innerHTML = [
      '<div id="hd-inq-head">',
        '<div id="hd-inq-head-left">',
          '<div id="hd-inq-head-title">The Inquiry Desk</div>',
          '<div id="hd-inq-head-sub">Eleanor Voss &middot; MSS. Hale-Marsh &middot; Bodleian Libraries</div>',
        '</div>',
        '<button id="hd-inq-close" aria-label="Close">&times;</button>',
      '</div>',
      '<div id="hd-inq-convo">',
        '<div class="hd-msg hd-msg-eleanor">',
          '<div class="hd-msg-lbl">Eleanor Voss &middot; Archivist</div>',
          'Good day. Ask me anything about the Hale family, the documents, or the archive &mdash; or press <em>Ask the Archive</em> to retrieve something from the collection.',
        '</div>',
        '<div id="hd-inq-suggestions">',
          '<div class="hd-sug-label">suggested inquiries</div>',
          '<button class="hd-sug-btn">Who was Matilda, and what did she know?</button>',
          '<button class="hd-sug-btn">What was found at the bottom of the deed-box?</button>',
          '<button class="hd-sug-btn">Tell me about the pig.</button>',
        '</div>',
        '<div id="hd-inq-typing">',
          '<span class="hd-type-dot">&bull;</span>',
          '<span class="hd-type-dot">&bull;</span>',
          '<span class="hd-type-dot">&bull;</span> consulting the archive',
        '</div>',
      '</div>',
      '<div id="hd-inq-input-area">',
        '<textarea id="hd-inq-input" rows="2"',
          ' placeholder="Ask a question about the archive\u2026"',
          ' maxlength="600"></textarea>',
        '<div id="hd-inq-btn-row">',
          '<button class="hd-inq-btn" id="hd-inq-submit-btn">Submit Inquiry &rarr;</button>',
          '<button class="hd-inq-btn" id="hd-inq-oracle-btn">&#10022; Ask the Archive</button>',
        '</div>',
      '</div>',
    ].join('');
    document.body.appendChild(panel);

    var convo           = panel.querySelector('#hd-inq-convo');
    var suggestions     = panel.querySelector('#hd-inq-suggestions');
    var typing          = panel.querySelector('#hd-inq-typing');
    var input           = panel.querySelector('#hd-inq-input');
    var submitBtn       = panel.querySelector('#hd-inq-submit-btn');
    var oracleBtn       = panel.querySelector('#hd-inq-oracle-btn');
    var closeBtn        = panel.querySelector('#hd-inq-close');
    var isOpen          = false;
    var isBusy          = false;
    var messageDiv      = null;

    // Load history
    conversationHistory = loadHistory();

    // Restore messages if history exists
    if (conversationHistory.length > 0) {
      suggestions.style.display = 'none';

      // "Restored" banner
      var restoreBanner = document.createElement('div');
      restoreBanner.id = 'hd-inq-restored';
      restoreBanner.style.cssText = [
        'font-family:"Courier New",monospace',
        'font-size:0.62em',
        'letter-spacing:0.15em',
        'text-transform:uppercase',
        'color:#6A5A38',
        'padding:8px 0 12px',
        'text-align:center',
        'border-bottom:1px solid rgba(200,168,40,0.12)',
        'margin-bottom:10px',
        'display:flex',
        'justify-content:center',
        'align-items:center',
        'gap:12px',
      ].join(';');

      var clearBtn = document.createElement('button');
      clearBtn.textContent = '× Clear';
      clearBtn.style.cssText = [
        'background:none',
        'border:1px solid rgba(200,168,40,0.2)',
        'color:#8A6A28',
        'font-family:"Courier New",monospace',
        'font-size:1em',
        'letter-spacing:0.12em',
        'text-transform:uppercase',
        'padding:2px 8px',
        'cursor:pointer',
        'border-radius:1px',
      ].join(';');
      clearBtn.addEventListener('click', function () {
        clearHistory();
        convo.innerHTML = '';
        suggestions.style.display = '';
        restoreBanner.remove();
      });

      restoreBanner.innerHTML = '<span>— Previous conversation restored —</span>';
      restoreBanner.appendChild(clearBtn);
      convo.appendChild(restoreBanner);

      for (var h = 0; h < conversationHistory.length; h++) {
        var msg = conversationHistory[h];
        if (msg.role === 'user') {
          addMsg('hd-msg-user', msg.content);
        } else {
          addMsg('hd-msg-eleanor', msg.content, 'Eleanor Voss &middot; Archivist');
        }
      }
    }

    /* ── Helpers ───────────────────────── */
    function scrollBottom() {
      setTimeout(function () { convo.scrollTop = convo.scrollHeight; }, 50);
    }

    function addMsg(cls, html, label) {
      var t = document.getElementById('hd-inq-typing');
      if (t) convo.appendChild(t);
      var div = document.createElement('div');
      div.className = 'hd-msg ' + cls;
      div.innerHTML = label
        ? '<div class="hd-msg-lbl">' + label + '</div>' + html
        : html;
      convo.insertBefore(div, t || null);
      scrollBottom();
      return div;
    }

    function setBusy(busy) {
      isBusy = busy;
      submitBtn.disabled = busy;
      oracleBtn.disabled = busy;
      typing.classList.toggle('show', busy);
      scrollBottom();
    }

    function hideSuggestions() {
      suggestions.style.display = 'none';
    }

    /* ── Open / Close ──────────────────── */
    function openPanel() {
      isOpen = true;
      panel.classList.add('open');
      fab.classList.add('open');
      fab.setAttribute('aria-label', 'Close Inquiry Desk');
      setTimeout(function () { input.focus(); }, 400);
    }
    function closePanel() {
      isOpen = false;
      panel.classList.remove('open');
      fab.classList.remove('open');
      fab.setAttribute('aria-label', 'Open Inquiry Desk');
    }
    fab.addEventListener('click', function () {
      if (isOpen) closePanel(); else openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    /* ── Error handler ─────────────────── */
    function handleError(type) {
      setBusy(false);
      if (type === 'rate_limit') {
        addMsg('hd-msg-eleanor',
          'The archive has received too many inquiries in a short time. Please wait a moment before trying again.',
          'Eleanor Voss &middot; Archivist');
      } else {
        addMsg('hd-msg-eleanor',
          'The archive is momentarily unreachable. Please try again shortly.',
          'Eleanor Voss &middot; Archivist');
      }
    }

    /* ── Submit question ───────────────── */
    function submitQuestion(q) {
      var question = q || input.value.trim();
      if (!question || isBusy) return;
      input.value = '';
      hideSuggestions();
      addMsg('hd-msg-user', question);

      // Create empty Eleanor message
      messageDiv = addMsg('hd-msg-eleanor', '', 'Eleanor Voss &middot; Archivist');

      setBusy(true);

      // 800ms atmospheric pause
      setTimeout(function () {
        callEleanorStream(question,
          function (chunk, fullText) {
            messageDiv.innerHTML = '<div class="hd-msg-lbl">Eleanor Voss &middot; Archivist</div>' + fullText;
            scrollBottom();
          },
          function (fullText) {
            messageDiv.innerHTML = '<div class="hd-msg-lbl">Eleanor Voss &middot; Archivist</div>' + fullText;
            setBusy(false);
          },
          handleError
        );
      }, 800);
    }

    submitBtn.addEventListener('click', function () {
      submitQuestion();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuestion(); }
    });
    input.addEventListener('input', hideSuggestions);

    /* ── Suggested questions ───────────── */
    var sugBtns = panel.querySelectorAll('.hd-sug-btn');
    for (var i = 0; i < sugBtns.length; i++) {
      sugBtns[i].addEventListener('click', function (e) {
        submitQuestion(e.target.textContent);
      });
    }

    /* ── Oracle ────────────────────────── */
    oracleBtn.addEventListener('click', function () {
      if (isBusy) return;
      setBusy(true);

      var prompt = 'Retrieve one small, precise archival moment from the Hale-Marsh Collection — a fragment, a quote, an object, an observation. Present it as you would pull a document from the deed-box and hold it up to the light. Include the source (volume, date). One short paragraph only. Do not use markdown.';
      var prevLen = conversationHistory.length;
      callEleanor(prompt, function (answer) {
        conversationHistory.length = prevLen;
        addMsg('hd-msg-oracle', answer, 'From the Archive &middot; Eleanor Voss');
        setBusy(false);
      }, function () {
        conversationHistory.length = prevLen;
        var o = ORACLE[Math.floor(Math.random() * ORACLE.length)];
        addMsg('hd-msg-oracle', o.text, o.label + ' &middot; From the Archive');
        setBusy(false);
      });
    });

    /* ── Close on outside click ────────── */
    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && e.target !== fab) closePanel();
    });

    /* ── First-visit nudge — shows once, 20s after page load ── */
    var NUDGE_KEY = 'hd_eleanor_nudge_seen';
    if (!localStorage.getItem(NUDGE_KEY)) {
      setTimeout(function () {
        if (isOpen) return; // already open, skip
        var nudge = document.createElement('div');
        nudge.id = 'hd-eleanor-nudge';
        nudge.style.cssText = [
          'position:fixed',
          'bottom:80px',
          'right:24px',
          'z-index:8000',
          'background:rgba(14,12,10,0.97)',
          'border:1px solid rgba(200,168,60,0.28)',
          'padding:11px 16px',
          'font-family:Georgia,serif',
          'font-style:italic',
          'font-size:0.78em',
          'color:rgba(200,168,60,0.75)',
          'pointer-events:none',
          'opacity:0',
          'transition:opacity 0.8s ease',
          'max-width:220px',
          'line-height:1.55',
          'box-shadow:0 4px 24px rgba(0,0,0,0.6)'
        ].join(';');
        nudge.textContent = 'The archivist will answer questions.';
        document.body.appendChild(nudge);
        // Fade in
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { nudge.style.opacity = '1'; });
        });
        // Fade out after 5s
        setTimeout(function () {
          nudge.style.opacity = '0';
          setTimeout(function () { nudge.remove(); }, 900);
        }, 5000);
        try { localStorage.setItem(NUDGE_KEY, 'true'); } catch(e) {}
      }, 20000);
    }

  });

})();

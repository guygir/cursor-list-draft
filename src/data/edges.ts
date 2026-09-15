import type { AuthoredEdge } from "./types";

function rumor(from: AuthoredEdge["from"], to: AuthoredEdge["to"], s: number, contextHe: string): AuthoredEdge {
  return {
    from,
    to,
    type: "personal",
    s,
    reliability: "medium",
    source: {
      url: "https://en.wikipedia.org/wiki/Politics_of_Israel",
      date: "2026-09-10",
      contextHe,
      contextEn: "Gameplay rumor / remembered tension. Not a quote and not a file.",
    },
    reviewStatus: "draft",
  };
}

/** Remembered feuds and camp gossip. Gameplay color — not a quote and not a file. */
const RUMORS: AuthoredEdge[] = [
  rumor("bennett", "netanyahu", -0.55, "בנט ונתניהו היו שותפים ואחר כך נפרדו. שמועת משחק."),
  rumor("saar", "netanyahu", -0.3, "סער עזב וחזר. יש חשבון ישן. לא ציטוט — צבע."),
  rumor("lapid", "netanyahu", -0.5, "לפיד מול נתניהו. יריבות שכולם מכירים."),
  rumor("golan", "netanyahu", -0.55, "גולן ונתניהו לא נשמעים על אותה כרזה."),
  rumor("liberman", "deri", -0.45, "ליברמן וש״ס — חילוני מול חרדי. מתח ישן."),
  rumor("liberman", "ben-gvir", -0.4, "ליברמן ובן גביר לא אותה שפה."),
  rumor("liberman", "smotrich", -0.35, "ישראל ביתנו מול הציונות הדתית. חיכוך מוכר."),
  rumor("bennett", "ben-gvir", -0.4, "בנט ובן גביר. על הנייר קרובים, על הכרזה לא."),
  rumor("gantz", "ben-gvir", -0.35, "גנץ ובן גביר. הכרזה תיראה כמו בדיחה."),
  rumor("eisenkot", "ben-gvir", -0.4, "איזנקוט ובן גביר — שני עולמות."),
  rumor("golan", "ben-gvir", -0.6, "הדמוקרטים מול עוצמה. אדום כמעט מלא."),
  rumor("golan", "deri", -0.4, "שמאל מול ש״ס. סתם לא יושב."),
  rumor("deri", "lapid", -0.4, "דרעי ולפיד. אי-אמון ארוך."),
  rumor("smotrich", "lapid", -0.4, "סמוטריץ׳ ולפיד. מחנות הפוכים."),
  rumor("abbas", "ben-gvir", -0.7, "עבאס ובן גביר. כרזה כזאת נשברת מיד."),
  rumor("abbas", "netanyahu", -0.35, "רע״ם וליכוד — פעם ישבו ליד, היום זה רחוק."),
  rumor("tibi", "netanyahu", -0.45, "טיבי ונתניהו. יריבות ארוכה."),
  rumor("tibi", "ben-gvir", -0.65, "המשותפת מול עוצמה. אדום כבד."),
  rumor("levin", "golan", -0.4, "לוין וגולן — שני קצוות של ויכוח המשפט."),
  rumor("regev", "lapid", -0.3, "רגב ולפיד. רעש ישן."),
  rumor("gantz", "bennett", 0.12, "גנץ ובנט עברו במחנה השינוי. ירוק עדין."),
  rumor("eisenkot", "gantz", 0.12, "איזנקוט וגנץ. אותו אזור, לא ברית."),
  rumor("kahana", "bennett", 0.14, "כהנא ובנט. אותה שכונה פוליטית."),
  rumor("goldknopf", "deri", 0.1, "חרדים ליד חרדים. ירוק דק."),
];

/**
 * Hard reds are dated quotes. The rest is camp color and rumor.
 * Distance on the toy map is computed in chemistry.ts.
 */
export const EDGES: AuthoredEdge[] = [
  {
    from: "liberman",
    to: "netanyahu",
    type: "veto",
    s: -1.0,
    reliability: "high",
    source: {
      url: "https://www.timesofisrael.com/liveblog_entry/liberman-vows-not-to-join-any-coalition-with-netanyahu-or-raam-well-establish-a-zionist-government/",
      date: "2026-03-11",
      contextHe: "ליברמן אמר שלא ישב עם נתניהו. זה וטו — הכרזה נסדקת.",
      contextEn: "Liberman said he will not sit with Netanyahu. A veto — the poster cracks.",
    },
    reviewStatus: "draft",
  },
  {
    from: "liberman",
    to: "abbas",
    type: "veto",
    s: -1.0,
    reliability: "high",
    source: {
      url: "https://www.jpost.com/israel-news/politics-and-diplomacy/article-884505",
      date: "2026-03-11",
      contextHe: "ליברמן אמר את אותו דבר על רע״ם. עוד וטו.",
      contextEn: "Liberman said the same about Ra'am. Another veto.",
    },
    reviewStatus: "draft",
  },
  {
    from: "bennett",
    to: "deri",
    type: "split",
    s: -1.0,
    reliability: "high",
    source: {
      url: "https://www.jpost.com/israel-news/politics-and-diplomacy/article-891845",
      date: "2026-05-26",
      contextHe: "בנט מדבר על ממשלה של מי שמשרתים. דרעי בצד השני של הקו. קרע.",
      contextEn: "Bennett talks about a government of those who serve. Deri is on the other side. A split.",
    },
    reviewStatus: "draft",
  },
  {
    from: "netanyahu",
    to: "ohana",
    type: "same-faction",
    s: 0.15,
    reliability: "high",
    source: {
      url: "https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93",
      date: "2026-09-01",
      contextHe: "שניהם ליכוד. ירוק קל — אותה מפלגה.",
      contextEn: "Both Likud. Thin green — same party.",
    },
    reviewStatus: "draft",
  },
  {
    from: "bennett",
    to: "lapid",
    type: "served-together",
    s: 0.15,
    reliability: "high",
    source: {
      url: "https://he.wikipedia.org/wiki/%D7%9E%D7%9E%D7%A9%D7%9C%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%94%D7%A9%D7%9C%D7%95%D7%A9%D7%99%D7%9D_%D7%95%D7%A9%D7%A9",
      date: "2021-06-13",
      contextHe: "ישבו יחד בממשלה, ועכשיו גם באותה רשימה. ירוק.",
      contextEn: "Sat in government together, and now on the same slate. Green.",
    },
    reviewStatus: "draft",
  },
  {
    from: "gantz",
    to: "netanyahu",
    type: "served-together",
    s: 0.15,
    reliability: "high",
    source: {
      url: "https://he.wikipedia.org/wiki/%D7%9E%D7%9E%D7%A9%D7%9C%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%94%D7%A9%D7%9C%D7%95%D7%A9%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9",
      date: "2020-05-17",
      contextHe: "ישבו יחד בממשלת החילופים. המתח בין המחנות עדיין צובע את הקו.",
      contextEn: "Sat together in the rotation government. Camp tension still colors the edge.",
    },
    reviewStatus: "draft",
  },
  ...RUMORS,
];

export function authoredEdgesBetween(a: string, b: string): AuthoredEdge[] {
  return EDGES.filter(
    (edge) =>
      (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a),
  );
}

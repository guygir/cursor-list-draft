import { cellFromAspects, resolveAspects } from "./aspects";
import type { Person, PersonId, Role, SlateId } from "./types";

const LISTS_2026 =
  "https://en.wikipedia.org/wiki/Party_lists_for_the_2026_Israeli_legislative_election";

const SLATE_META: Record<SlateId, { partyEn: string; partyHe: string }> = {
  likud: { partyEn: "Likud", partyHe: "הליכוד" },
  otzma: { partyEn: "Otzma Yehudit", partyHe: "עוצמה יהודית" },
  rz: { partyEn: "Religious Zionism", partyHe: "הציונות הדתית" },
  shas: { partyEn: "Shas", partyHe: "ש״ס" },
  utj: { partyEn: "United Torah Judaism", partyHe: "יהדות התורה" },
  together: { partyEn: "B'Yachad / Yesh Atid", partyHe: "ביחד / יש עתיד" },
  yashar: { partyEn: "Yashar", partyHe: "ישר" },
  democrats: { partyEn: "The Democrats", partyHe: "הדמוקרטים" },
  "yisrael-beiteinu": { partyEn: "Yisrael Beiteinu", partyHe: "ישראל ביתנו" },
  raam: { partyEn: "Ra'am", partyHe: "רע״ם" },
  "blue-white": { partyEn: "Blue and White", partyHe: "כחול לבן" },
  "joint-list": { partyEn: "Joint List", partyHe: "הרשימה המשותפת" },
};

interface Seed {
  id: PersonId;
  nameEn: string;
  nameHe: string;
  slateId: SlateId;
  slot: number;
  role: Role;
  draw?: number;
  partyEn?: string;
  partyHe?: string;
  wiki?: string;
}

const SEEDS: Seed[] = [
  // Likud 2026 top 10
  { id: "netanyahu", nameEn: "Benjamin Netanyahu", nameHe: "בנימין נתניהו", slateId: "likud", slot: 1, role: "leader", draw: 1.0, wiki: "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99%D7%9E%D7%99%D7%9F_%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95" },
  { id: "eli-cohen", nameEn: "Eli Cohen", nameHe: "אלי כהן", slateId: "likud", slot: 2, role: "minister", draw: 0.7 },
  { id: "ohana", nameEn: "Amir Ohana", nameHe: "אמיר אוחנה", slateId: "likud", slot: 3, role: "minister", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%90%D7%9E%D7%99%D7%A8_%D7%90%D7%95%D7%97%D7%A0%D7%94" },
  { id: "levin", nameEn: "Yariv Levin", nameHe: "יריב לוין", slateId: "likud", slot: 4, role: "minister", draw: 0.7 },
  { id: "regev", nameEn: "Miri Regev", nameHe: "מירי רגב", slateId: "likud", slot: 5, role: "minister", draw: 0.7 },
  { id: "israel-katz", nameEn: "Israel Katz", nameHe: "ישראל כ״ץ", slateId: "likud", slot: 6, role: "minister", draw: 0.7 },
  { id: "saar", nameEn: "Gideon Sa'ar", nameHe: "גדעון סער", slateId: "likud", slot: 7, role: "minister", draw: 0.7 },
  { id: "ofir-katz", nameEn: "Ofir Katz", nameHe: "אופיר כץ", slateId: "likud", slot: 8, role: "mk" },
  { id: "talik-gvili", nameEn: "Talik Gvili", nameHe: "טליק גוילי", slateId: "likud", slot: 9, role: "newcomer" },
  { id: "kisch", nameEn: "Yoav Kisch", nameHe: "יואב קיש", slateId: "likud", slot: 10, role: "minister", draw: 0.7 },

  // Otzma 2026 top 10
  { id: "ben-gvir", nameEn: "Itamar Ben-Gvir", nameHe: "איתמר בן גביר", slateId: "otzma", slot: 1, role: "leader", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%AA%D7%9E%D7%A8_%D7%91%D7%9F_%D7%92%D7%91%D7%99%D7%A8" },
  { id: "gotliv", nameEn: "Tally Gotliv", nameHe: "טלי גוטליב", slateId: "otzma", slot: 2, role: "mk" },
  { id: "wasserlauf", nameEn: "Yitzhak Wasserlauf", nameHe: "יצחק וסרלאוף", slateId: "otzma", slot: 3, role: "minister", draw: 0.7 },
  { id: "amihai-eliyahu", nameEn: "Amihai Eliyahu", nameHe: "עמיחי אליהו", slateId: "otzma", slot: 4, role: "minister", draw: 0.7 },
  { id: "son-har-melech", nameEn: "Limor Son Har-Melech", nameHe: "לימור סון הר-מלך", slateId: "otzma", slot: 5, role: "mk" },
  { id: "kroizer", nameEn: "Yitzhak Kroizer", nameHe: "יצחק קרויזר", slateId: "otzma", slot: 6, role: "mk" },
  { id: "dorfman", nameEn: "Hanamel Dorfman", nameHe: "חנמאל דורפמן", slateId: "otzma", slot: 7, role: "newcomer" },
  { id: "tzachi-eliyahu", nameEn: "Tzachi Eliyahu", nameHe: "צחי אליהו", slateId: "otzma", slot: 8, role: "newcomer" },
  { id: "goldberger", nameEn: "Yossi Goldberger", nameHe: "יוסי גולדברגר", slateId: "otzma", slot: 9, role: "newcomer" },
  { id: "neeman", nameEn: "Itiel Ne'eman", nameHe: "איתיאל נעמן", slateId: "otzma", slot: 10, role: "newcomer" },

  // Religious Zionism–Zehut 2026 top 10
  { id: "smotrich", nameEn: "Bezalel Smotrich", nameHe: "בצלאל סמוטריץ׳", slateId: "rz", slot: 1, role: "leader", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%91%D7%A6%D7%9C%D7%90%D7%9C_%D7%A1%D7%9E%D7%95%D7%98%D7%A8%D7%99%D7%A5%27" },
  { id: "feiglin", nameEn: "Moshe Feiglin", nameHe: "משה פייגלין", slateId: "rz", slot: 2, role: "leader", draw: 0.7 },
  { id: "strook", nameEn: "Orit Strook", nameHe: "אורית סטרוק", slateId: "rz", slot: 3, role: "minister", draw: 0.7 },
  { id: "rothman", nameEn: "Simcha Rothman", nameHe: "שמחה רוטמן", slateId: "rz", slot: 4, role: "mk" },
  { id: "tzvika-mor", nameEn: "Tzvika Mor", nameHe: "צביקה מור", slateId: "rz", slot: 5, role: "newcomer" },
  { id: "eitam", nameEn: "Itamar Eitam", nameHe: "איתמר איתם", slateId: "rz", slot: 6, role: "newcomer" },
  { id: "sukkot", nameEn: "Zvi Sukkot", nameHe: "צבי סוכות", slateId: "rz", slot: 7, role: "mk" },
  { id: "zaga", nameEn: "Yitzhak Zaga", nameHe: "יצחק זאגא", slateId: "rz", slot: 8, role: "newcomer" },
  { id: "reut-ben-haim", nameEn: "Reut Ben Haim", nameHe: "רעות בן חיים", slateId: "rz", slot: 9, role: "newcomer" },
  { id: "patziniach", nameEn: "Omer Patziniach", nameHe: "עומר פציניאש", slateId: "rz", slot: 10, role: "newcomer" },

  // Shas 2026 top 10
  { id: "deri", nameEn: "Aryeh Deri", nameHe: "אריה דרעי", slateId: "shas", slot: 1, role: "leader", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%90%D7%A8%D7%99%D7%94_%D7%93%D7%A8%D7%A2%D7%99" },
  { id: "azoulay", nameEn: "Yinon Azoulay", nameHe: "ינון אזולאי", slateId: "shas", slot: 2, role: "mk" },
  { id: "malkieli", nameEn: "Michael Malkieli", nameHe: "מיכאל מלכיאלי", slateId: "shas", slot: 3, role: "minister", draw: 0.7 },
  { id: "ben-tzur", nameEn: "Yoav Ben-Tzur", nameHe: "יואב בן-צור", slateId: "shas", slot: 4, role: "minister", draw: 0.7 },
  { id: "biton", nameEn: "Haim Biton", nameHe: "חיים ביטון", slateId: "shas", slot: 5, role: "minister", draw: 0.7 },
  { id: "dror-amos", nameEn: "Dror Amos", nameHe: "דרור עמוס", slateId: "shas", slot: 6, role: "newcomer" },
  { id: "abutbul", nameEn: "Moshe Abutbul", nameHe: "משה אבוטבול", slateId: "shas", slot: 7, role: "mk" },
  { id: "buso", nameEn: "Uriel Buso", nameHe: "אוריאל בוסו", slateId: "shas", slot: 8, role: "minister", draw: 0.7 },
  { id: "taieb", nameEn: "Yosef Taieb", nameHe: "יוסף טייב", slateId: "shas", slot: 9, role: "mk" },
  { id: "mishraki", nameEn: "Yonatan Mishraki", nameHe: "יונתן משריקי", slateId: "shas", slot: 10, role: "mk" },

  // UTJ 2026 top 10
  { id: "yaakov-asher", nameEn: "Ya'akov Asher", nameHe: "יעקב אשר", slateId: "utj", slot: 1, role: "leader", draw: 0.7 },
  { id: "goldknopf", nameEn: "Yitzhak Goldknopf", nameHe: "יצחק גולדקנופף", slateId: "utj", slot: 2, role: "minister", draw: 0.7 },
  { id: "pindrus", nameEn: "Yitzhak Pindrus", nameHe: "יצחק פינדרוס", slateId: "utj", slot: 3, role: "mk" },
  { id: "porush", nameEn: "Meir Porush", nameHe: "מאיר פרוש", slateId: "utj", slot: 4, role: "minister", draw: 0.7 },
  { id: "rosenthal", nameEn: "Moshe Rosenthal", nameHe: "משה רוזנטל", slateId: "utj", slot: 5, role: "newcomer" },
  { id: "stark", nameEn: "Elakim Stark", nameHe: "אליקים סטארק", slateId: "utj", slot: 6, role: "newcomer" },
  { id: "weisfish", nameEn: "Yehuda Weisfish", nameHe: "יהודה וייספיש", slateId: "utj", slot: 7, role: "newcomer" },
  { id: "tessler", nameEn: "Ya'akov Tessler", nameHe: "יעקב טסלר", slateId: "utj", slot: 8, role: "mk" },
  { id: "zeltz", nameEn: "Dudi Zeltz", nameHe: "דודי זלץ", slateId: "utj", slot: 9, role: "newcomer" },
  { id: "david-ohana", nameEn: "David Ohana", nameHe: "דוד אוחנה", slateId: "utj", slot: 10, role: "newcomer" },

  // Together (B'Yachad + Yesh Atid) 2026 top 10
  { id: "bennett", nameEn: "Naftali Bennett", nameHe: "נפתלי בנט", slateId: "together", slot: 1, role: "leader", draw: 1.0, partyEn: "B'Yachad", partyHe: "ביחד", wiki: "https://he.wikipedia.org/wiki/%D7%A0%D7%A4%D7%AA%D7%9C%D7%99_%D7%91%D7%A0%D7%98" },
  { id: "lapid", nameEn: "Yair Lapid", nameHe: "יאיר לפיד", slateId: "together", slot: 2, role: "leader", draw: 0.85, partyEn: "Yesh Atid", partyHe: "יש עתיד", wiki: "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%9C%D7%A4%D7%99%D7%93" },
  { id: "turner", nameEn: "Keren Terner Eyal", nameHe: "קרן טרנר אייל", slateId: "together", slot: 3, role: "newcomer", partyEn: "B'Yachad", partyHe: "ביחד" },
  { id: "ben-ari", nameEn: "Meirav Ben-Ari", nameHe: "מירב בן-ארי", slateId: "together", slot: 4, role: "mk", partyEn: "Yesh Atid", partyHe: "יש עתיד" },
  { id: "avisar", nameEn: "Liran Avisar Ben Horin", nameHe: "לירן אבישר בן-חורין", slateId: "together", slot: 5, role: "newcomer", partyEn: "B'Yachad", partyHe: "ביחד" },
  { id: "tibon", nameEn: "Noam Tibon", nameHe: "נועם תיבון", slateId: "together", slot: 6, role: "newcomer", partyEn: "Yesh Atid", partyHe: "יש עתיד" },
  { id: "negri", nameEn: "Michal Negri", nameHe: "מיכל נגרי", slateId: "together", slot: 7, role: "newcomer", partyEn: "B'Yachad", partyHe: "ביחד" },
  { id: "ginzburg", nameEn: "Eitan Ginzburg", nameHe: "איתן גינזבורג", slateId: "together", slot: 8, role: "mk", partyEn: "B'Yachad", partyHe: "ביחד" },
  { id: "meirav-cohen", nameEn: "Meirav Cohen", nameHe: "מירב כהן", slateId: "together", slot: 9, role: "minister", draw: 0.7, partyEn: "Yesh Atid", partyHe: "יש עתיד" },
  { id: "shalev", nameEn: "Yonatan Shalev", nameHe: "יונתן שלו", slateId: "together", slot: 10, role: "newcomer", partyEn: "B'Yachad", partyHe: "ביחד" },

  // Yashar 2026 top 10
  { id: "eisenkot", nameEn: "Gadi Eisenkot", nameHe: "גדי איזנקוט", slateId: "yashar", slot: 1, role: "leader", draw: 0.9, wiki: "https://he.wikipedia.org/wiki/%D7%92%D7%93%D7%99_%D7%90%D7%99%D7%96%D7%A0%D7%A7%D7%95%D7%98" },
  { id: "yoram-cohen", nameEn: "Yoram Cohen", nameHe: "יורם כהן", slateId: "yashar", slot: 2, role: "newcomer" },
  { id: "farkash", nameEn: "Orit Farkash-Hacohen", nameHe: "אורית פרקש-הכהן", slateId: "yashar", slot: 3, role: "minister", draw: 0.7 },
  { id: "altschuler", nameEn: "Adi Altschuler", nameHe: "עדי אלטשולר", slateId: "yashar", slot: 4, role: "newcomer" },
  { id: "kahana", nameEn: "Matan Kahana", nameHe: "מתן כהנא", slateId: "yashar", slot: 5, role: "minister", draw: 0.7 },
  { id: "tropper", nameEn: "Hili Tropper", nameHe: "חילי טרופר", slateId: "yashar", slot: 6, role: "minister", draw: 0.7 },
  { id: "meridor", nameEn: "Shaul Meridor", nameHe: "שאול מרידור", slateId: "yashar", slot: 7, role: "newcomer" },
  { id: "ifergan", nameEn: "Tair Ifergan", nameHe: "תאיר איפרגן", slateId: "yashar", slot: 8, role: "newcomer" },
  { id: "gani-gonen", nameEn: "Oshrat Gani Gonen", nameHe: "אושרת גני גונן", slateId: "yashar", slot: 9, role: "newcomer" },
  { id: "shapira", nameEn: "Shira Shapira", nameHe: "שירה שפירא", slateId: "yashar", slot: 10, role: "newcomer" },

  // Democrats 2026 top 10
  { id: "golan", nameEn: "Yair Golan", nameHe: "יאיר גולן", slateId: "democrats", slot: 1, role: "leader", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%92%D7%95%D7%9C%D7%9F" },
  { id: "lazimi", nameEn: "Naama Lazimi", nameHe: "נעמה לזימי", slateId: "democrats", slot: 2, role: "mk" },
  { id: "kariv", nameEn: "Gilad Kariv", nameHe: "גלעד קריב", slateId: "democrats", slot: 3, role: "mk" },
  { id: "rayten", nameEn: "Efrat Rayten", nameHe: "עפרת רייטן", slateId: "democrats", slot: 4, role: "mk" },
  { id: "fink", nameEn: "Yaya Fink", nameHe: "יאיה פינק", slateId: "democrats", slot: 5, role: "newcomer" },
  { id: "lasky", nameEn: "Gaby Lasky", nameHe: "גבי לסקי", slateId: "democrats", slot: 6, role: "mk" },
  { id: "ronen", nameEn: "Omri Ronen", nameHe: "עמרי רונן", slateId: "democrats", slot: 7, role: "newcomer" },
  { id: "rozin", nameEn: "Michal Rozin", nameHe: "מיכל רוזין", slateId: "democrats", slot: 8, role: "mk" },
  { id: "radman", nameEn: "Moshe Radman", nameHe: "משה רדמן", slateId: "democrats", slot: 9, role: "newcomer" },
  { id: "bashir", nameEn: "Somaya Bashir", nameHe: "סומיא בשיר", slateId: "democrats", slot: 10, role: "newcomer" },

  // Yisrael Beiteinu 2026 top 10
  { id: "liberman", nameEn: "Avigdor Liberman", nameHe: "אביגדור ליברמן", slateId: "yisrael-beiteinu", slot: 1, role: "leader", draw: 0.75, wiki: "https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%99%D7%92%D7%93%D7%95%D7%A8_%D7%9C%D7%99%D7%91%D7%A8%D7%9E%D7%9F" },
  { id: "ben-shitrit", nameEn: "Rafi Ben Shitrit", nameHe: "רפי בן שטרית", slateId: "yisrael-beiteinu", slot: 2, role: "newcomer" },
  { id: "lankri", nameEn: "Talya Lankri", nameHe: "טליה לנקרי", slateId: "yisrael-beiteinu", slot: 3, role: "newcomer" },
  { id: "forer", nameEn: "Oded Forer", nameHe: "עודד פורר", slateId: "yisrael-beiteinu", slot: 4, role: "minister", draw: 0.7 },
  { id: "malinovsky", nameEn: "Yulia Malinovsky", nameHe: "יוליה מלינובסקי", slateId: "yisrael-beiteinu", slot: 5, role: "mk" },
  { id: "sharabi", nameEn: "Sharon Sharabi", nameHe: "שרון שרעבי", slateId: "yisrael-beiteinu", slot: 6, role: "newcomer" },
  { id: "amar", nameEn: "Hamad Amar", nameHe: "חמד עמאר", slateId: "yisrael-beiteinu", slot: 7, role: "mk" },
  { id: "sova", nameEn: "Evgeny Sova", nameHe: "יבגני סובה", slateId: "yisrael-beiteinu", slot: 8, role: "mk" },
  { id: "kolihman", nameEn: "Elvira Kolihman", nameHe: "אלבירה קוליכמן", slateId: "yisrael-beiteinu", slot: 9, role: "newcomer" },
  { id: "illouz", nameEn: "Dan Illouz", nameHe: "דן אילוז", slateId: "yisrael-beiteinu", slot: 10, role: "mk" },

  // Ra'am 2026 — only published names (6)
  { id: "abbas", nameEn: "Mansour Abbas", nameHe: "מנסור עבאס", slateId: "raam", slot: 1, role: "leader", draw: 0.55, wiki: "https://he.wikipedia.org/wiki/%D7%9E%D7%A0%D7%A1%D7%95%D7%A8_%D7%A2%D7%91%D7%90%D7%A1" },
  { id: "segalovitz", nameEn: "Yoav Segalovitz", nameHe: "יואב סגלוביץ", slateId: "raam", slot: 2, role: "mk" },
  { id: "taha", nameEn: "Waleed Taha", nameHe: "וליד טאהא", slateId: "raam", slot: 3, role: "mk" },
  { id: "alhwashla", nameEn: "Waleed Alhwashla", nameHe: "וליד אלחוואשלה", slateId: "raam", slot: 4, role: "mk" },
  { id: "khatib-yasin", nameEn: "Iman Khatib-Yasin", nameHe: "אימאן ח׳טיב-יאסין", slateId: "raam", slot: 5, role: "mk" },
  { id: "hujeirat", nameEn: "Yasir Hujeirat", nameHe: "יאסר חוג׳יראת", slateId: "raam", slot: 6, role: "mk" },

  // Blue and White 2026 — only published names (6)
  { id: "gantz", nameEn: "Benny Gantz", nameHe: "בני גנץ", slateId: "blue-white", slot: 1, role: "leader", draw: 0.7, wiki: "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99_%D7%92%D7%A0%D7%A5" },
  { id: "tamano-shata", nameEn: "Pnina Tamano-Shata", nameHe: "פנינה תמנו-שטה", slateId: "blue-white", slot: 2, role: "minister", draw: 0.7 },
  { id: "bloch", nameEn: "Aliza Bloch", nameHe: "עליזה בלוך", slateId: "blue-white", slot: 3, role: "newcomer" },
  { id: "konkol", nameEn: "Roee Konkol", nameHe: "רועי קונקול", slateId: "blue-white", slot: 4, role: "newcomer" },
  { id: "avidar", nameEn: "Rotem Avidar Tzalik", nameHe: "רותם אבידר צליק", slateId: "blue-white", slot: 5, role: "newcomer" },
  { id: "schuster", nameEn: "Alon Schuster", nameHe: "אלון שוסטר", slateId: "blue-white", slot: 6, role: "mk" },

  // Joint List 2026 — named slots only
  { id: "jabareen", nameEn: "Yousef Jabareen", nameHe: "יוסף ג׳בארין", slateId: "joint-list", slot: 1, role: "leader", draw: 0.55 },
  { id: "tibi", nameEn: "Ahmad Tibi", nameHe: "אחמד טיבי", slateId: "joint-list", slot: 2, role: "leader", draw: 0.55 },
  { id: "abu-shehadeh", nameEn: "Sami Abu Shehadeh", nameHe: "סמי אבו שחאדה", slateId: "joint-list", slot: 3, role: "leader", draw: 0.55 },
  { id: "ghattas", nameEn: "Faten Ghattas", nameHe: "פאתן ע׳טאס", slateId: "joint-list", slot: 4, role: "newcomer" },
  { id: "awawdeh", nameEn: "Bakhar Awawdeh", nameHe: "בכר עוואודה", slateId: "joint-list", slot: 5, role: "newcomer" },
  { id: "cassif", nameEn: "Ofer Cassif", nameHe: "עופר כסיף", slateId: "joint-list", slot: 6, role: "mk" },
  { id: "atauna", nameEn: "Youssef Atauna", nameHe: "יוסף עטאונה", slateId: "joint-list", slot: 7, role: "mk" },
  { id: "karkabi", nameEn: "Maha Karkabi", nameHe: "מהא כרכבי", slateId: "joint-list", slot: 8, role: "newcomer" },
  { id: "washahi", nameEn: "Nihaya Washahi", nameHe: "נהאיה ושחי", slateId: "joint-list", slot: 10, role: "newcomer" },
];

function roleDraw(role: Role): number {
  if (role === "leader") return 0.7;
  if (role === "minister") return 0.7;
  if (role === "mk") return 0.45;
  return 0.25;
}

/** Identity is public 2026 list record. Aspects, cell, and draw are game fields. */
export const PEOPLE: Person[] = SEEDS.map((seed) => {
  const meta = SLATE_META[seed.slateId];
  const resolved = resolveAspects({
    id: seed.id,
    slateId: seed.slateId,
    role: seed.role,
    ...(seed.partyHe ? { partyHe: seed.partyHe } : {}),
  });
  return {
    id: seed.id,
    nameEn: seed.nameEn,
    nameHe: seed.nameHe,
    partyEn: seed.partyEn ?? meta.partyEn,
    partyHe: seed.partyHe ?? meta.partyHe,
    slateId: seed.slateId,
    listSlot: seed.slot,
    role: seed.role,
    draw: seed.draw ?? roleDraw(seed.role),
    aspects: resolved.aspects,
    cell: cellFromAspects(resolved.aspects),
    aspectsNoteHe: resolved.noteHe,
    aspectsNoteEn: resolved.noteEn,
    identitySource: {
      url: seed.wiki ?? LISTS_2026,
      date: "2026-09-08",
      note: "Published 2026 list identity; not an electability claim.",
      reviewStatus: "draft",
    },
  };
});

export const POOL_IDS: PersonId[] = PEOPLE.map((p) => p.id);

export const SLATE_ORDER: SlateId[] = [
  "likud",
  "otzma",
  "rz",
  "shas",
  "utj",
  "together",
  "yashar",
  "democrats",
  "yisrael-beiteinu",
  "raam",
  "blue-white",
  "joint-list",
];

const byId = new Map(PEOPLE.map((p) => [p.id, p]));

export function getPerson(id: PersonId): Person {
  const person = byId.get(id);
  if (!person) {
    throw new Error(`Unknown person: ${id}`);
  }
  return person;
}

export function slateLabelHe(id: SlateId): string {
  return SLATE_META[id].partyHe;
}

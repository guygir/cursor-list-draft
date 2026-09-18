import { getPerson } from "./pool";
import type { PersonId, SlateId } from "./types";

const SLATE_INK: Record<SlateId, string> = {
  likud: "#3f6d4c",
  otzma: "#8a3530",
  rz: "#6b4a1e",
  shas: "#3a5f7a",
  utj: "#3d4a6b",
  together: "#2f6a6a",
  yashar: "#4a5d3a",
  democrats: "#3d5a7a",
  "yisrael-beiteinu": "#5a4a2a",
  raam: "#2f5e4a",
  "blue-white": "#3a5c78",
  "joint-list": "#4a3d5c",
};

/** Wikipedia thumbnails. Identity art only — not an endorsement or electability claim. */
export const PORTRAITS: Partial<Record<PersonId, { url: string; source: string }>> = {
  "abbas": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Mansour_Abbas_April_3%2C_2023_16.jpg/250px-Mansour_Abbas_April_3%2C_2023_16.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A0%D7%A1%D7%95%D7%A8_%D7%A2%D7%91%D7%90%D7%A1"
  },
  "abu-shehadeh": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Sami_Abou_Shahadeh.png/250px-Sami_Abou_Shahadeh.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A1%D7%90%D7%9E%D7%99_%D7%90%D7%91%D7%95_%D7%A9%D7%97%D7%90%D7%93%D7%94"
  },
  "abutbul": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Moshe_Abutbul_%28ISH_9834%29.jpg/250px-Moshe_Abutbul_%28ISH_9834%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94_%D7%90%D7%91%D7%95%D7%98%D7%91%D7%95%D7%9C"
  },
  "alhwashla": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Walid_Alhawashla_2025.jpg/250px-Walid_Alhawashla_2025.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%95%D7%90%D7%9C%D7%99%D7%93_%D7%90%D7%9C%D7%94%D7%95%D7%90%D7%A9%D7%9C%D7%94"
  },
  "altschuler": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/0/05/%D7%A2%D7%93%D7%99_%D7%90%D7%9C%D7%98%D7%A9%D7%95%D7%9C%D7%A8.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail_unscaled",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%93%D7%99_%D7%90%D7%9C%D7%98%D7%A9%D7%95%D7%9C%D7%A8"
  },
  "amar": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Hamad_Amar_%28E32J0875%29.jpg/250px-Hamad_Amar_%28E32J0875%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%9E%D7%93_%D7%A2%D7%9E%D7%90%D7%A8"
  },
  "amihai-eliyahu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Amichai_Eliyahu_%28cropped%29.jpg/250px-Amichai_Eliyahu_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%9E%D7%99%D7%97%D7%99_%D7%90%D7%9C%D7%99%D7%94%D7%95"
  },
  "atauna": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Youssef_Atauna_%28ISH_9163%29.jpg/250px-Youssef_Atauna_%28ISH_9163%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%A3_%D7%A2%D7%98%D7%90%D7%95%D7%A0%D7%94"
  },
  "avisar": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/%D7%9C%D7%99%D7%A8%D7%9F_%D7%90%D7%91%D7%99%D7%A9%D7%A8_%D7%91%D7%9F%D6%BE%D7%97%D7%95%D7%A8%D7%99%D7%9F_%28cropped%29.jpg/250px-%D7%9C%D7%99%D7%A8%D7%9F_%D7%90%D7%91%D7%99%D7%A9%D7%A8_%D7%91%D7%9F%D6%BE%D7%97%D7%95%D7%A8%D7%99%D7%9F_%28cropped%29.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%9C%D7%99%D7%A8%D7%9F_%D7%90%D7%91%D7%99%D7%A9%D7%A8_%D7%91%D7%9F-%D7%97%D7%95%D7%A8%D7%99%D7%9F"
  },
  "azoulay": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Yinon_Azulai_%28SHL_9064%29.jpg/250px-Yinon_Azulai_%28SHL_9064%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A0%D7%95%D7%9F_%D7%90%D7%96%D7%95%D7%9C%D7%90%D7%99"
  },
  "bashir": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/145993_alternative_lighting_ceremonyalternative_independ_PikiWiki_Israel_%28cropped%29.jpg/250px-145993_alternative_lighting_ceremonyalternative_independ_PikiWiki_Israel_%28cropped%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://en.wikipedia.org/wiki/Somaya_Bashir"
  },
  "ben-ari": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99.jpg/250px-%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99"
  },
  "ben-gvir": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Itamar_Ben_Gvir_3_%28cropped%29.jpg/250px-Itamar_Ben_Gvir_3_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%AA%D7%9E%D7%A8_%D7%91%D7%9F_%D7%92%D7%91%D7%99%D7%A8"
  },
  "ben-shitrit": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/%D7%A8%D7%A4%D7%99_%D7%91%D7%9F_%D7%A9%D7%98%D7%A8%D7%99%D7%AA.jpg/250px-%D7%A8%D7%A4%D7%99_%D7%91%D7%9F_%D7%A9%D7%98%D7%A8%D7%99%D7%AA.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%A8%D7%A4%D7%99_%D7%91%D7%9F_%D7%A9%D7%98%D7%A8%D7%99%D7%AA"
  },
  "ben-tzur": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Yoav_Ben-Tzur_1.jpg/250px-Yoav_Ben-Tzur_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%90%D7%91_%D7%91%D7%9F_%D7%A6%D7%95%D7%A8"
  },
  "bennett": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/250px-Naftali_Bennett_official_portrait.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A0%D7%A4%D7%AA%D7%9C%D7%99_%D7%91%D7%A0%D7%98"
  },
  "biton": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Chaim_Biton_%28SHL_9193%29.jpg/250px-Chaim_Biton_%28SHL_9193%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%99%D7%99%D7%9D_%D7%91%D7%99%D7%98%D7%95%D7%9F"
  },
  "bloch": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Aliza_Bloch.jpg/250px-Aliza_Bloch.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%9C%D7%99%D7%96%D7%94_%D7%91%D7%9C%D7%95%D7%9A"
  },
  "buso": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95_%D7%9C%D7%A2%D7%9E.jpg/250px-%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95_%D7%9C%D7%A2%D7%9E.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95"
  },
  "cassif": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Ofer_Cassif.png/250px-Ofer_Cassif.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%A4%D7%A8_%D7%9B%D7%A1%D7%99%D7%A3"
  },
  "deri": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Aryeh_Deri_%28E32J1375%29.jpg/250px-Aryeh_Deri_%28E32J1375%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%A8%D7%99%D7%94_%D7%93%D7%A8%D7%A2%D7%99"
  },
  "eisenkot": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Gadi_Eisenkot_2_%28cropped%29.jpg/250px-Gadi_Eisenkot_2_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%93%D7%99_%D7%90%D7%99%D7%96%D7%A0%D7%A7%D7%95%D7%98"
  },
  "eli-cohen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/%D7%A9%D7%A8_%D7%94%D7%9B%D7%9C%D7%9B%D7%9C%D7%94_%D7%95%D7%94%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%2C_%D7%97%D7%91%D7%A8_%D7%94%D7%A7%D7%91%D7%99%D7%A0%D7%98_%D7%94%D7%91%D7%98%D7%97%D7%95%D7%A0%D7%99_%D7%9E%D7%93%D7%99%D7%A0%D7%99_%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F._%D7%9C%D7%99%D7%9B%D7%95%D7%93_%28cropped%29.jpg/250px-%D7%A9%D7%A8_%D7%94%D7%9B%D7%9C%D7%9B%D7%9C%D7%94_%D7%95%D7%94%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%2C_%D7%97%D7%91%D7%A8_%D7%94%D7%A7%D7%91%D7%99%D7%A0%D7%98_%D7%94%D7%91%D7%98%D7%97%D7%95%D7%A0%D7%99_%D7%9E%D7%93%D7%99%D7%A0%D7%99_%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F._%D7%9C%D7%99%D7%9B%D7%95%D7%93_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F_(%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99%D7%A7%D7%90%D7%99,_1972)"
  },
  "farkash": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9_%D7%94%D7%9B%D7%94%D7%9F-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg/250px-%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9_%D7%94%D7%9B%D7%94%D7%9F-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9-%D7%94%D7%9B%D7%94%D7%9F"
  },
  "feiglin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F.jpg/250px-%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94_%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F"
  },
  "fink": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Yaya_Fink_%28cropped%29.jpg/250px-Yaya_Fink_%28cropped%29.jpg",
    "source": "https://en.wikipedia.org/wiki/Yaya_Fink"
  },
  "forer": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Oded_Forer_%28ISH_0467%29.jpg/250px-Oded_Forer_%28ISH_0467%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%93%D7%93_%D7%A4%D7%95%D7%A8%D7%A8"
  },
  "gani-gonen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/%D7%A6%D7%99%D7%9C%D7%95%D7%9E%D7%99_%D7%AA%D7%93%D7%9E%D7%99%D7%AA_%D7%90%D7%95%D7%A9%D7%A8%D7%AA_%D7%92%D7%A0%D7%99_%D7%92%D7%95%D7%A0%D7%9F.jpg/250px-%D7%A6%D7%99%D7%9C%D7%95%D7%9E%D7%99_%D7%AA%D7%93%D7%9E%D7%99%D7%AA_%D7%90%D7%95%D7%A9%D7%A8%D7%AA_%D7%92%D7%A0%D7%99_%D7%92%D7%95%D7%A0%D7%9F.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A9%D7%A8%D7%AA_%D7%92%D7%A0%D7%99_%D7%92%D7%95%D7%A0%D7%9F"
  },
  "gantz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Israeli_Minister_Benny_Gantz_at_the_Department_of_State_in_Washington%2C_D.C._on_March_5%2C_2024_%28cropped%29.jpg/250px-Israeli_Minister_Benny_Gantz_at_the_Department_of_State_in_Washington%2C_D.C._on_March_5%2C_2024_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99_%D7%92%D7%A0%D7%A5"
  },
  "ginzburg": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Eitan_Ginzburg_%28ISH_6674%29.jpg/250px-Eitan_Ginzburg_%28ISH_6674%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%AA%D7%9F_%D7%92%D7%99%D7%A0%D7%96%D7%91%D7%95%D7%A8%D7%92"
  },
  "golan": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Yair_Golan_%28SHL_9404%29.jpg/250px-Yair_Golan_%28SHL_9404%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%92%D7%95%D7%9C%D7%9F"
  },
  "goldknopf": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Yitzchak_Goldknopf_1.jpg/250px-Yitzchak_Goldknopf_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%92%D7%95%D7%9C%D7%93%D7%A7%D7%A0%D7%95%D7%A4%D7%A3"
  },
  "gotliv": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Tali_Gottleib_%28R_H_3795%29.jpg/250px-Tali_Gottleib_%28R_H_3795%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%98%D7%9C%D7%99_%D7%92%D7%95%D7%98%D7%9C%D7%99%D7%91"
  },
  "hujeirat": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Yasir_Hujeirat_%28R_H_3858%29.jpg/250px-Yasir_Hujeirat_%28R_H_3858%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%A1%D7%A8_%D7%97%D7%95%D7%92%27%D7%99%D7%A8%D7%90%D7%AA"
  },
  "ifergan": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/%D7%AA%D7%9E%D7%95%D7%A0%D7%AA_%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C_%D7%AA%D7%90%D7%99%D7%A8_%D7%90%D7%99%D7%A4%D7%A8%D7%92%D7%9F.jpeg/250px-%D7%AA%D7%9E%D7%95%D7%A0%D7%AA_%D7%A4%D7%A8%D7%95%D7%A4%D7%99%D7%9C_%D7%AA%D7%90%D7%99%D7%A8_%D7%90%D7%99%D7%A4%D7%A8%D7%92%D7%9F.jpeg",
    "source": "https://he.wikipedia.org/wiki/%D7%AA%D7%90%D7%99%D7%A8_%D7%90%D7%99%D7%A4%D7%A8%D7%92%D7%9F"
  },
  "illouz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Dan_Illouz_%28crop%29.jpg/250px-Dan_Illouz_%28crop%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%93%D7%9F_%D7%90%D7%99%D7%9C%D7%95%D7%96"
  },
  "israel-katz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Israel_Katz_on_July_3%2C_2024_%28cropped%29.jpg/250px-Israel_Katz_on_July_3%2C_2024_%28cropped%29.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%9B%22%D7%A5_(%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93)"
  },
  "jabareen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Yousef_Jabareen_2021.png/250px-Yousef_Jabareen_2021.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%A3_%D7%92%27%D7%91%D7%90%D7%A8%D7%99%D7%9F"
  },
  "kahana": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/MatanK-DSC_0053a.jpg/250px-MatanK-DSC_0053a.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%AA%D7%9F_%D7%9B%D7%94%D7%A0%D7%90"
  },
  "kariv": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Gilad_Kariv.png/250px-Gilad_Kariv.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%9C%D7%A2%D7%93_%D7%A7%D7%A8%D7%99%D7%91"
  },
  "khatib-yasin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Iman_Khatib_Yassin_1.jpg/250px-Iman_Khatib_Yassin_1.jpg",
    "source": "https://en.wikipedia.org/wiki/Iman_Khatib-Yassin"
  },
  "kisch": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Yoav_Kish_%28SHL_9437%29.jpg/250px-Yoav_Kish_%28SHL_9437%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%90%D7%91_%D7%A7%D7%99%D7%A9"
  },
  "kroizer": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/%D7%97%D7%91%D7%A8_%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8.jpg/250px-%D7%97%D7%91%D7%A8_%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8"
  },
  "lapid": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Yair_Lapid_%28D1237-011%29.jpg/250px-Yair_Lapid_%28D1237-011%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%9C%D7%A4%D7%99%D7%93"
  },
  "lasky": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Gaby_Lasky_180222_023_%28cropped%29.jpg/250px-Gaby_Lasky_180222_023_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%91%D7%99_%D7%9C%D7%A1%D7%A7%D7%99"
  },
  "lazimi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Naama_lazimi_%28cropped%29.jpg/250px-Naama_lazimi_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A0%D7%A2%D7%9E%D7%94_%D7%9C%D7%96%D7%99%D7%9E%D7%99"
  },
  "levin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Yariv_Levin_1_%28cropped%29.jpg/250px-Yariv_Levin_1_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A8%D7%99%D7%91_%D7%9C%D7%95%D7%99%D7%9F"
  },
  "liberman": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Avigdor_Lieberman_2017.jpg/250px-Avigdor_Lieberman_2017.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%99%D7%92%D7%93%D7%95%D7%A8_%D7%9C%D7%99%D7%91%D7%A8%D7%9E%D7%9F"
  },
  "malinovsky": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Julia_Malinovsky_%28SHL_8919%29.jpg/250px-Julia_Malinovsky_%28SHL_8919%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%9C%D7%99%D7%94_%D7%9E%D7%9C%D7%99%D7%A0%D7%95%D7%91%D7%A1%D7%A7%D7%99"
  },
  "malkieli": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Michael_Malchieli_1.jpg/250px-Michael_Malchieli_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%9B%D7%90%D7%9C_%D7%9E%D7%9C%D7%9B%D7%99%D7%90%D7%9C%D7%99"
  },
  "meirav-cohen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Meirav_Cohen_%28SHL_9279%29.jpg/250px-Meirav_Cohen_%28SHL_9279%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%91_%D7%9B%D7%94%D7%9F"
  },
  "meridor": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Shaul_Meridor.jpeg/250px-Shaul_Meridor.jpeg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A9%D7%90%D7%95%D7%9C_%D7%9E%D7%A8%D7%99%D7%93%D7%95%D7%A8"
  },
  "mishraki": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Yonatan_Mashriki_2026_portrait.jpg/250px-Yonatan_Mashriki_2026_portrait.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://en.wikipedia.org/wiki/Yonatan_Mishraki"
  },
  "mufid-mari": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Mofid_mare.jpg/250px-Mofid_mare.jpg",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%95%D7%A4%D7%99%D7%93_%D7%9E%D7%A8%D7%A2%D7%99"
  },
  "netanyahu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/250px-Benjamin_Netanyahu%2C_February_2023.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99%D7%9E%D7%99%D7%9F_%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95"
  },
  "ofir-katz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Ofir_Katz.jpg/250px-Ofir_Katz.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A4%D7%99%D7%A8_%D7%9B%D7%A5"
  },
  "ohana": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Amir_Ohana_-_Official.jpg/250px-Amir_Ohana_-_Official.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9E%D7%99%D7%A8_%D7%90%D7%95%D7%97%D7%A0%D7%94"
  },
  "pindrus": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1.jpg/250px-%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1"
  },
  "porush": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9.jpg/250px-%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9"
  },
  "radman": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Moshe_Radman.png/250px-Moshe_Radman.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94_%D7%A8%D7%93%D7%9E%D7%9F_%D7%90%D7%91%D7%95%D7%98%D7%91%D7%95%D7%9C"
  },
  "rayten": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Efrat_Rayten.jpg/250px-Efrat_Rayten.jpg",
    "source": "https://en.wikipedia.org/wiki/Efrat_Rayten"
  },
  "regev": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Miri_Regev_02_%28cropped%29.jpg/250px-Miri_Regev_02_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%99_%D7%A8%D7%92%D7%91"
  },
  "ronen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Omri_Ronen_2024_%28cropped%29.jpg/250px-Omri_Ronen_2024_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%9E%D7%A8%D7%99_%D7%A8%D7%95%D7%A0%D7%9F_(%D7%A4%D7%A2%D7%99%D7%9C_%D7%97%D7%91%D7%A8%D7%AA%D7%99)"
  },
  "rothman": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Simcha_Rothman_%28SHL_8150%29.jpg/250px-Simcha_Rothman_%28SHL_8150%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A9%D7%9E%D7%97%D7%94_%D7%A8%D7%95%D7%98%D7%9E%D7%9F"
  },
  "rozin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F_2026.jpg/250px-%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F_2026.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F"
  },
  "saar": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Gideon_Saar_new.jpg/250px-Gideon_Saar_new.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%93%D7%A2%D7%95%D7%9F_%D7%A1%D7%A2%D7%A8"
  },
  "schuster": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Alon_Schuster_%28R_H_4454%29.jpg/250px-Alon_Schuster_%28R_H_4454%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9C%D7%95%D7%9F_%D7%A9%D7%95%D7%A1%D7%98%D7%A8"
  },
  "segalovitz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Yoav_Segalovich_%28R_H_4069%29.jpg/250px-Yoav_Segalovich_%28R_H_4069%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%90%D7%91_%D7%A1%D7%92%D7%9C%D7%95%D7%91%D7%99%D7%A5"
  },
  "shalev": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/%D7%99%D7%95%D7%A0%D7%AA%D7%9F_%D7%A9%D7%9C%D7%95_%28cropped%29.JPEG/250px-%D7%99%D7%95%D7%A0%D7%AA%D7%9F_%D7%A9%D7%9C%D7%95_%28cropped%29.JPEG",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A0%D7%AA%D7%9F_%D7%A9%D7%9C%D7%95"
  },
  "smotrich": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Bezalel_Smotrich.jpg/250px-Bezalel_Smotrich.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A6%D7%9C%D7%90%D7%9C_%D7%A1%D7%9E%D7%95%D7%98%D7%A8%D7%99%D7%A5%27"
  },
  "son-har-melech": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Limor_Son_Har-Melech.jpg/250px-Limor_Son_Har-Melech.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9C%D7%99%D7%9E%D7%95%D7%A8_%D7%A1%D7%95%D7%9F_%D7%94%D7%A8-%D7%9E%D7%9C%D7%9A"
  },
  "sova": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Evgeny_Sova_%28SHL_8643%29.jpg/250px-Evgeny_Sova_%28SHL_8643%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%91%D7%92%D7%A0%D7%99_%D7%A1%D7%95%D7%91%D7%94"
  },
  "strook": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Orit_Strook.jpg/250px-Orit_Strook.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A1%D7%98%D7%A8%D7%95%D7%A7"
  },
  "sukkot": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA_%28cropped%29.jpg/250px-%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA"
  },
  "taha": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Walid_Taha_%28SHL_8811%29.jpg/250px-Walid_Taha_%28SHL_8811%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%95%D7%9C%D7%99%D7%93_%D7%98%D7%90%D7%94%D7%90"
  },
  "taieb": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Joseph_Taieb_%28ZAC_3485%29.jpg/250px-Joseph_Taieb_%28ZAC_3485%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%99_%D7%98%D7%99%D7%99%D7%91"
  },
  "tamano-shata": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95-%D7%A9%D7%98%D7%94_%28cropped%29.jpg/250px-%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95-%D7%A9%D7%98%D7%94_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95"
  },
  "tessler": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Jacob_Tessler_%28R_H_3994%29.jpg/250px-Jacob_Tessler_%28R_H_3994%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A2%D7%A7%D7%91_%D7%98%D7%A1%D7%9C%D7%A8"
  },
  "tibi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Ahmad_Tibi_2021_%28cropped%29.png/250px-Ahmad_Tibi_2021_%28cropped%29.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%97%D7%9E%D7%93_%D7%98%D7%99%D7%91%D7%99"
  },
  "tibon": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Noam_Tibon_Behind_Flag.jpg/250px-Noam_Tibon_Behind_Flag.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A0%D7%A2%D7%9D_%D7%AA%D7%99%D7%91%D7%95%D7%9F"
  },
  "tropper": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8_-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg/250px-%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8_-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8"
  },
  "turner": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/%D7%A7%D7%A8%D7%9F_%D7%98%D7%A8%D7%A0%D7%A8_%28cropped%29.jpg/250px-%D7%A7%D7%A8%D7%9F_%D7%98%D7%A8%D7%A0%D7%A8_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A7%D7%A8%D7%9F_%D7%98%D7%A8%D7%A0%D7%A8"
  },
  "tzvika-mor": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/%D7%A6%D7%91%D7%99%D7%A7%D7%94_%D7%9E%D7%95%D7%A8_%28cropped%29.jpg/250px-%D7%A6%D7%91%D7%99%D7%A7%D7%94_%D7%9E%D7%95%D7%A8_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A6%D7%91%D7%99%D7%A7%D7%94_%D7%9E%D7%95%D7%A8"
  },
  "wasserlauf": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Itshak_Waserlauf.jpg/250px-Itshak_Waserlauf.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%95%D7%A1%D7%A8%D7%9C%D7%90%D7%95%D7%A3"
  },
  "yaakov-asher": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Yaakev_asher.jpg/250px-Yaakev_asher.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A2%D7%A7%D7%91_%D7%90%D7%A9%D7%A8"
  },
  "yoram-cohen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Yoram-Cohen-0003.jpg/250px-Yoram-Cohen-0003.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A8%D7%9D_%D7%9B%D7%94%D7%9F"
  }
};

export function portraitUrl(id: PersonId): string | null {
  const raw = PORTRAITS[id]?.url;
  if (!raw) return null;
  return raw.split("?")[0];
}

/** Wikipedia photo when authored; otherwise a slate-colored initial card. */
export function portraitSrc(id: PersonId): string {
  return portraitUrl(id) ?? generatedPortrait(id);
}

export function hasWikiPortrait(id: PersonId): boolean {
  return portraitUrl(id) !== null;
}

export function bindPortrait(img: HTMLImageElement, id: PersonId): HTMLImageElement {
  img.addEventListener("error", () => {
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = generatedPortrait(id);
  });
  return img;
}

/** First + last Hebrew initials. Used when Wikipedia has no free photo. */
export function initialsHe(nameHe: string): string {
  const parts = nameHe.split(/[\s־\-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`;
  }
  return nameHe.slice(0, 2);
}

export function generatedPortrait(id: PersonId): string {
  const person = getPerson(id);
  const ink = SLATE_INK[person.slateId];
  const letters = initialsHe(person.nameHe);
  const last = person.nameHe.split(/[\s־\-]+/).filter(Boolean).at(-1) ?? person.nameHe;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" role="img" aria-label="${escapeXml(person.nameHe)}">
  <rect width="80" height="80" fill="#1c1f27"/>
  <circle cx="40" cy="36" r="24" fill="${ink}"/>
  <text x="40" y="43" text-anchor="middle" font-size="20" font-family="Rubik, Arial Hebrew, sans-serif" fill="#e4ddd0">${escapeXml(letters)}</text>
  <text x="40" y="70" text-anchor="middle" font-size="9" font-family="Rubik, Arial Hebrew, sans-serif" fill="#f4d53b">${escapeXml(last)}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

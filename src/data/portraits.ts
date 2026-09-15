import type { PersonId } from "./types";

/** Wikipedia thumbnails. Identity art only — not an endorsement or electability claim. */
export const PORTRAITS: Partial<Record<PersonId, { url: string; source: string }>> = {
  "netanyahu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Benjamin_Netanyahu%2C_February_2023.jpg/250px-Benjamin_Netanyahu%2C_February_2023.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99%D7%9E%D7%99%D7%9F_%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95"
  },
  "eli-cohen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/%D7%A9%D7%A8_%D7%94%D7%9B%D7%9C%D7%9B%D7%9C%D7%94_%D7%95%D7%94%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%2C_%D7%97%D7%91%D7%A8_%D7%94%D7%A7%D7%91%D7%99%D7%A0%D7%98_%D7%94%D7%91%D7%98%D7%97%D7%95%D7%A0%D7%99_%D7%9E%D7%93%D7%99%D7%A0%D7%99_%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F._%D7%9C%D7%99%D7%9B%D7%95%D7%93_%28cropped%29.jpg/250px-%D7%A9%D7%A8_%D7%94%D7%9B%D7%9C%D7%9B%D7%9C%D7%94_%D7%95%D7%94%D7%AA%D7%A2%D7%A9%D7%99%D7%99%D7%94%2C_%D7%97%D7%91%D7%A8_%D7%94%D7%A7%D7%91%D7%99%D7%A0%D7%98_%D7%94%D7%91%D7%98%D7%97%D7%95%D7%A0%D7%99_%D7%9E%D7%93%D7%99%D7%A0%D7%99_%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F._%D7%9C%D7%99%D7%9B%D7%95%D7%93_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9C%D7%99_%D7%9B%D7%94%D7%9F_(%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99%D7%A7%D7%90%D7%99,_1972)"
  },
  "ohana": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Amir_Ohana_-_Official.jpg/250px-Amir_Ohana_-_Official.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9E%D7%99%D7%A8_%D7%90%D7%95%D7%97%D7%A0%D7%94"
  },
  "levin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Yariv_Levin_1_%28cropped%29.jpg/250px-Yariv_Levin_1_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A8%D7%99%D7%91_%D7%9C%D7%95%D7%99%D7%9F"
  },
  "regev": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Miri_Regev_02_%28cropped%29.jpg/250px-Miri_Regev_02_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%99_%D7%A8%D7%92%D7%91"
  },
  "saar": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Gideon_Saar_new.jpg/250px-Gideon_Saar_new.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%93%D7%A2%D7%95%D7%9F_%D7%A1%D7%A2%D7%A8"
  },
  "ofir-katz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Ofir_Katz.jpg/250px-Ofir_Katz.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A4%D7%99%D7%A8_%D7%9B%D7%A5"
  },
  "kisch": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Yoav_Kish_%28SHL_9437%29.jpg/250px-Yoav_Kish_%28SHL_9437%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%90%D7%91_%D7%A7%D7%99%D7%A9"
  },
  "ben-gvir": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Itamar_Ben_Gvir_3_%28cropped%29.jpg/250px-Itamar_Ben_Gvir_3_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%AA%D7%9E%D7%A8_%D7%91%D7%9F_%D7%92%D7%91%D7%99%D7%A8"
  },
  "gotliv": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Tali_Gottleib_%28R_H_3795%29.jpg/250px-Tali_Gottleib_%28R_H_3795%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%98%D7%9C%D7%99_%D7%92%D7%95%D7%98%D7%9C%D7%99%D7%91"
  },
  "wasserlauf": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Itshak_Waserlauf.jpg/250px-Itshak_Waserlauf.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%95%D7%A1%D7%A8%D7%9C%D7%90%D7%95%D7%A3"
  },
  "amihai-eliyahu": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Amichai_Eliyahu_%28cropped%29.jpg/250px-Amichai_Eliyahu_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%9E%D7%99%D7%97%D7%99_%D7%90%D7%9C%D7%99%D7%94%D7%95"
  },
  "son-har-melech": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Limor_Son_Har-Melech.jpg/250px-Limor_Son_Har-Melech.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9C%D7%99%D7%9E%D7%95%D7%A8_%D7%A1%D7%95%D7%9F_%D7%94%D7%A8-%D7%9E%D7%9C%D7%9A"
  },
  "kroizer": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/%D7%97%D7%91%D7%A8_%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8.jpg/250px-%D7%97%D7%91%D7%A8_%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%A7%D7%A8%D7%95%D7%99%D7%96%D7%A8"
  },
  "smotrich": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Bezalel_Smotrich.jpg/250px-Bezalel_Smotrich.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A6%D7%9C%D7%90%D7%9C_%D7%A1%D7%9E%D7%95%D7%98%D7%A8%D7%99%D7%A5%27"
  },
  "feiglin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F.jpg/250px-%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94_%D7%A4%D7%99%D7%99%D7%92%D7%9C%D7%99%D7%9F"
  },
  "strook": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Orit_Strook.jpg/250px-Orit_Strook.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A1%D7%98%D7%A8%D7%95%D7%A7"
  },
  "rothman": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Simcha_Rothman_%28SHL_8150%29.jpg/250px-Simcha_Rothman_%28SHL_8150%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A9%D7%9E%D7%97%D7%94_%D7%A8%D7%95%D7%98%D7%9E%D7%9F"
  },
  "sukkot": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA_%28cropped%29.jpg/250px-%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A6%D7%91%D7%99_%D7%A1%D7%95%D7%9B%D7%95%D7%AA"
  },
  "deri": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Aryeh_Deri_%28E32J1375%29.jpg/250px-Aryeh_Deri_%28E32J1375%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%A8%D7%99%D7%94_%D7%93%D7%A8%D7%A2%D7%99"
  },
  "azoulay": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Yinon_Azulai_%28SHL_9064%29.jpg/250px-Yinon_Azulai_%28SHL_9064%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A0%D7%95%D7%9F_%D7%90%D7%96%D7%95%D7%9C%D7%90%D7%99"
  },
  "malkieli": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Michael_Malchieli_1.jpg/250px-Michael_Malchieli_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%9B%D7%90%D7%9C_%D7%9E%D7%9C%D7%9B%D7%99%D7%90%D7%9C%D7%99"
  },
  "ben-tzur": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Yoav_Ben-Tzur_1.jpg/250px-Yoav_Ben-Tzur_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%90%D7%91_%D7%91%D7%9F_%D7%A6%D7%95%D7%A8"
  },
  "biton": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Chaim_Biton_%28SHL_9193%29.jpg/250px-Chaim_Biton_%28SHL_9193%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%99%D7%99%D7%9D_%D7%91%D7%99%D7%98%D7%95%D7%9F"
  },
  "abutbul": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Moshe_Abutbul_%28ISH_9834%29.jpg/250px-Moshe_Abutbul_%28ISH_9834%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%94_%D7%90%D7%91%D7%95%D7%98%D7%91%D7%95%D7%9C"
  },
  "buso": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95_%D7%9C%D7%A2%D7%9E.jpg/250px-%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95_%D7%9C%D7%A2%D7%9E.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%90%D7%9C_%D7%91%D7%95%D7%A1%D7%95"
  },
  "taieb": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Joseph_Taieb_%28ZAC_3485%29.jpg/250px-Joseph_Taieb_%28ZAC_3485%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%99_%D7%98%D7%99%D7%99%D7%91"
  },
  "yaakov-asher": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Yaakev_asher.jpg/250px-Yaakev_asher.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A2%D7%A7%D7%91_%D7%90%D7%A9%D7%A8"
  },
  "goldknopf": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Yitzchak_Goldknopf_1.jpg/250px-Yitzchak_Goldknopf_1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%92%D7%95%D7%9C%D7%93%D7%A7%D7%A0%D7%95%D7%A4%D7%A3"
  },
  "pindrus": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1.jpg/250px-%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A6%D7%97%D7%A7_%D7%A4%D7%99%D7%A0%D7%93%D7%A8%D7%95%D7%A1"
  },
  "porush": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9.jpg/250px-%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%90%D7%99%D7%A8_%D7%A4%D7%A8%D7%95%D7%A9"
  },
  "tessler": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Jacob_Tessler_%28R_H_3994%29.jpg/250px-Jacob_Tessler_%28R_H_3994%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%A2%D7%A7%D7%91_%D7%98%D7%A1%D7%9C%D7%A8"
  },
  "bennett": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Naftali_Bennett_official_portrait.jpg/250px-Naftali_Bennett_official_portrait.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A0%D7%A4%D7%AA%D7%9C%D7%99_%D7%91%D7%A0%D7%98"
  },
  "lapid": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Yair_Lapid_%28D1237-011%29.jpg/250px-Yair_Lapid_%28D1237-011%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%9C%D7%A4%D7%99%D7%93"
  },
  "ben-ari": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99.jpg/250px-%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%91_%D7%91%D7%9F_%D7%90%D7%A8%D7%99"
  },
  "ginzburg": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Eitan_Ginzburg_%28ISH_6674%29.jpg/250px-Eitan_Ginzburg_%28ISH_6674%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%AA%D7%9F_%D7%92%D7%99%D7%A0%D7%96%D7%91%D7%95%D7%A8%D7%92"
  },
  "meirav-cohen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Meirav_Cohen_%28SHL_9279%29.jpg/250px-Meirav_Cohen_%28SHL_9279%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%A8%D7%91_%D7%9B%D7%94%D7%9F"
  },
  "eisenkot": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Gadi_Eisenkot_2_%28cropped%29.jpg/250px-Gadi_Eisenkot_2_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%93%D7%99_%D7%90%D7%99%D7%96%D7%A0%D7%A7%D7%95%D7%98"
  },
  "farkash": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9_%D7%94%D7%9B%D7%94%D7%9F-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg/250px-%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9_%D7%94%D7%9B%D7%94%D7%9F-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%95%D7%A8%D7%99%D7%AA_%D7%A4%D7%A8%D7%A7%D7%A9-%D7%94%D7%9B%D7%94%D7%9F"
  },
  "kahana": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/MatanK-DSC_0053a.jpg/250px-MatanK-DSC_0053a.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%AA%D7%9F_%D7%9B%D7%94%D7%A0%D7%90"
  },
  "tropper": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8_-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg/250px-%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8_-_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%99%D7%9C%D7%99_%D7%98%D7%A8%D7%95%D7%A4%D7%A8"
  },
  "golan": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Yair_Golan_%28SHL_9404%29.jpg/250px-Yair_Golan_%28SHL_9404%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%90%D7%99%D7%A8_%D7%92%D7%95%D7%9C%D7%9F"
  },
  "lazimi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Naama_lazimi_%28cropped%29.jpg/250px-Naama_lazimi_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A0%D7%A2%D7%9E%D7%94_%D7%9C%D7%96%D7%99%D7%9E%D7%99"
  },
  "kariv": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Gilad_Kariv.png/250px-Gilad_Kariv.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%9C%D7%A2%D7%93_%D7%A7%D7%A8%D7%99%D7%91"
  },
  "lasky": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Gaby_Lasky_180222_023_%28cropped%29.jpg/250px-Gaby_Lasky_180222_023_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%92%D7%91%D7%99_%D7%9C%D7%A1%D7%A7%D7%99"
  },
  "rozin": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F_2026.jpg/250px-%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F_2026.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%99%D7%9B%D7%9C_%D7%A8%D7%95%D7%96%D7%99%D7%9F"
  },
  "liberman": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Avigdor_Lieberman_2017.jpg/250px-Avigdor_Lieberman_2017.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%91%D7%99%D7%92%D7%93%D7%95%D7%A8_%D7%9C%D7%99%D7%91%D7%A8%D7%9E%D7%9F"
  },
  "forer": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Oded_Forer_%28ISH_0467%29.jpg/250px-Oded_Forer_%28ISH_0467%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%93%D7%93_%D7%A4%D7%95%D7%A8%D7%A8"
  },
  "malinovsky": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Julia_Malinovsky_%28SHL_8919%29.jpg/250px-Julia_Malinovsky_%28SHL_8919%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%9C%D7%99%D7%94_%D7%9E%D7%9C%D7%99%D7%A0%D7%95%D7%91%D7%A1%D7%A7%D7%99"
  },
  "amar": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Hamad_Amar_%28E32J0875%29.jpg/250px-Hamad_Amar_%28E32J0875%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%97%D7%9E%D7%93_%D7%A2%D7%9E%D7%90%D7%A8"
  },
  "sova": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Evgeny_Sova_%28SHL_8643%29.jpg/250px-Evgeny_Sova_%28SHL_8643%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%91%D7%92%D7%A0%D7%99_%D7%A1%D7%95%D7%91%D7%94"
  },
  "illouz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Dan_Illouz_%28crop%29.jpg/250px-Dan_Illouz_%28crop%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%93%D7%9F_%D7%90%D7%99%D7%9C%D7%95%D7%96"
  },
  "abbas": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Mansour_Abbas_April_3%2C_2023_16.jpg/250px-Mansour_Abbas_April_3%2C_2023_16.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%9E%D7%A0%D7%A1%D7%95%D7%A8_%D7%A2%D7%91%D7%90%D7%A1"
  },
  "taha": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Walid_Taha_%28SHL_8811%29.jpg/250px-Walid_Taha_%28SHL_8811%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%95%D7%9C%D7%99%D7%93_%D7%98%D7%90%D7%94%D7%90"
  },
  "gantz": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Israeli_Minister_Benny_Gantz_at_the_Department_of_State_in_Washington%2C_D.C._on_March_5%2C_2024_%28cropped%29.jpg/250px-Israeli_Minister_Benny_Gantz_at_the_Department_of_State_in_Washington%2C_D.C._on_March_5%2C_2024_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%91%D7%A0%D7%99_%D7%92%D7%A0%D7%A5"
  },
  "tamano-shata": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95-%D7%A9%D7%98%D7%94_%28cropped%29.jpg/250px-%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95-%D7%A9%D7%98%D7%94_%28cropped%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A4%D7%A0%D7%99%D7%A0%D7%94_%D7%AA%D7%9E%D7%A0%D7%95"
  },
  "schuster": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Alon_Schuster_%28R_H_4454%29.jpg/250px-Alon_Schuster_%28R_H_4454%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%9C%D7%95%D7%9F_%D7%A9%D7%95%D7%A1%D7%98%D7%A8"
  },
  "jabareen": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Yousef_Jabareen_2021.png/250px-Yousef_Jabareen_2021.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%A3_%D7%92%27%D7%91%D7%90%D7%A8%D7%99%D7%9F"
  },
  "tibi": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Ahmad_Tibi_2021_%28cropped%29.png/250px-Ahmad_Tibi_2021_%28cropped%29.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%90%D7%97%D7%9E%D7%93_%D7%98%D7%99%D7%91%D7%99"
  },
  "abu-shehadeh": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Sami_Abou_Shahadeh.png/250px-Sami_Abou_Shahadeh.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A1%D7%90%D7%9E%D7%99_%D7%90%D7%91%D7%95_%D7%A9%D7%97%D7%90%D7%93%D7%94"
  },
  "cassif": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Ofer_Cassif.png/250px-Ofer_Cassif.png?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%A2%D7%95%D7%A4%D7%A8_%D7%9B%D7%A1%D7%99%D7%A3"
  },
  "atauna": {
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Youssef_Atauna_%28ISH_9163%29.jpg/250px-Youssef_Atauna_%28ISH_9163%29.jpg?utm_source=he.wikipedia.org&utm_campaign=api&utm_content=thumbnail",
    "source": "https://he.wikipedia.org/wiki/%D7%99%D7%95%D7%A1%D7%A3_%D7%A2%D7%98%D7%90%D7%95%D7%A0%D7%94"
  }
};

export function portraitUrl(id: PersonId): string | null {
  const raw = PORTRAITS[id]?.url;
  if (!raw) return null;
  return raw.split("?")[0];
}

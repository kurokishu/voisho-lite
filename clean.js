/* Voisho スマホだけ版：話した言葉を、決まりだけで読みやすくする（AI を使わない・iPhone の中だけ） */
(function (root) {
  const FILLERS = "(?:えー+と?|え|ええ+と|えっと|えと|あのー+|あのう|あの|うーん|うーむ|んー+|まあ|まぁ|なんか|何か|その|こう|ええ|あ)";
  const P = "(^|[、。？！\\s])";

  function fillers(t) {
    // 「えー、」「あの、」のように、読点やすきまが続く言いよどみだけを消す（「その本」「なんか食べたい」は消さない）
    const re = new RegExp(P + FILLERS + "[ー〜…]*[、,\\s]+", "g");
    t = t.replace(re, "$1").replace(re, "$1");   // 「えー、あの、」の2つ目
    t = t.replace(new RegExp(P + "(?:えー+|えっと|あのー+|うーん)[ー〜…]*(?=[^、。]|$)", "g"), "$1");
    return t;
  }

  const restateKeep = (seg) => { const m = seg.match(/^.*[はがをにでへとも](?=.)/); return m ? m[0] : ""; };

  function restate(t) {
    // 言い直しは後のほうだけ残す：「10時、あ、ちがう、11時」「3時、いや4時」「AじゃなくてB」
    const marks = "(?:あ[、\\s]*)?(?:ちがう|違う|ちがった|違った|間違えた|まちがえた)|いや|いえ";
    // 消すのは言い直す前の「中身」だけ。「集合は3時」のように前に「は・が・を…」があれば、そこまでは残す
    t = t.replace(new RegExp("([^、。？！\\s]{1,12})[、\\s]+(?:" + marks + ")[、\\s]+", "g"), (_, seg) => restateKeep(seg));
    t = t.replace(/([^、。？！\s]{1,12})じゃなくて[、\s]*/g, (_, seg) => restateKeep(seg));
    return t;
  }

  function restateTight(t) {
    // 読点なしで続く言い直し（「3時から、いや4時から」）。
    // 「それは、違う方法で」を消さないよう、ここでは「いや」「あ、ちがう」だけを見る
    t = t.replace(/([^、。？！\s]{1,12})[、\s]+(?:いや|あ[、\s]*(?:ちがう|違う))(?=[0-9０-９一-龠々ァ-ヶA-Za-z])/g, (_, seg) => restateKeep(seg));
    return t;
  }

  function tidy(t) {
    t = t.replace(/(\S{1,6})[、\s]+\1/g, "$1");   // 同じ言葉のくり返し（「これ、これって」）
    t = t.replace(/、{2,}/g, "、").replace(/^[、\s]+/, "");
    t = t.replace(/\s*([、。？！])\s*/g, "$1");
    return t.trim();
  }

  function applyWords(t, words) {
    for (const w of words || []) if (w && w.from) t = t.split(w.from).join(w.to || "");
    return t;
  }

  function clean(text, words) {
    let t = String(text || "").replace(/[ \t　]+/g, " ").trim();
    if (/[ぁ-んァ-ヶ一-龠]/.test(t)) t = t.replace(/\?/g, "？").replace(/!/g, "！");
    t = applyWords(t, words);
    t = restateTight(t);   // 「あ、」を言いよどみとして消す前に見る
    t = fillers(t);
    t = restate(t);
    t = tidy(t);
    if (t && !/[。？！]$/.test(t)) t += "。";
    return t;
  }

  const api = { clean, fillers, restate, tidy };
  if (typeof module !== "undefined") module.exports = api; else root.VoishoClean = api;
})(this);

const categories = [
  { key: "eyes", short: "人の目", name: "① 人の目が気になる", message: "周りの人の表情や反応を、自分のこと以上に気にしている時間が少し増えているのかもしれません。\n\n「どう思われるか」ではなく、「私はどう感じているか」を少しだけ見てみてもいいかもしれません。" },
  { key: "trueFeelings", short: "本音", name: "② 本音がわからなくなる", message: "周りに合わせることが続くと、自分の気持ちが見えにくくなることがあります。\n\nすぐに答えを出さなくても大丈夫です。「本当はどうしたかったかな」と少し立ち止まってみるだけでも十分です。" },
  { key: "overthinking", short: "考えすぎ", name: "③ 考えすぎてしまう", message: "頭の中で何度も出来事を振り返っていると、気持ちまで休めなくなることがあります。\n\n考えることを止めようとするより、「今、また考えているな」と気づいてあげるところからでも大丈夫です。" },
  { key: "overwork", short: "頑張りすぎ", name: "④ 頑張りすぎて疲れている", message: "人に頼るより、自分で何とかしようとする時間が増えているのかもしれません。\n\n今は何かを増やすより、少し減らせるものがないかを考えてみてもいいかもしれません。" },
  { key: "future", short: "これから", name: "⑤ これからに迷っている", message: "これからのことを考えるほど、正しい答えを探したくなることがあります。\n\n今すぐ人生全体を決めなくても大丈夫です。「次に何をしてみたいか」くらいの小さなところから考えてみてもいいかもしれません。" }
];

const questionGroups = [
  ["人からどう思われているかが気になる", "人の顔色や声のトーンに敏感に反応してしまう", "自分の意見を言う前に、相手の反応を考えてしまう", "人に嫌われることを強く恐れてしまう", "周囲の期待に応えなければ、と頑張りすぎる", "人前ではなかなか自然体になれない"],
  ["「本当はどうしたい？」と聞かれると言葉につまる", "自分の気持ちを言葉にするのが難しい", "人に合わせているうちに、自分の意見がわからなくなる", "自分のやりたいことがよくわからない", "嫌だったはずなのに「まあいいか」と流してしまう", "自分の感情にふたをすることが多い"],
  ["過去の失敗や発言を何度も思い出す", "「あの選択でよかったのかな」と後から不安になる", "人から言われた一言を長く引きずってしまう", "小さなミスでも自己嫌悪になりやすい", "自分の発言で誰かを傷つけなかったか気になる", "夜になると「このままでいいのかな」と考えてしまう"],
  ["人に頼るより自分で何とかしようとする", "自分のことを後回しにするのが当たり前になっている", "休んでいると焦りや罪悪感を覚える", "日常をこなすだけで精一杯に感じることがある", "心のエネルギーが減っている感覚がある", "心から安心して笑える時間が減った"],
  ["これからどう生きたいのか迷うことがある", "自分の決断に自信が持てない", "新しいことを始めたいけれど失敗が怖い", "周囲のペースについていけない焦りがある", "理想と現実の差を見て落ち込むことがある", "「私の人生、このままでいいのかな」と感じる"]
];
const questions = questionGroups.flatMap((group, index) => group.map(text => ({ text, category: categories[index].key })));
let answers = Array(questions.length).fill(null);
let currentIndex = 0;
let toastTimer;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => { screen.hidden = screen.id !== id; });
  window.scrollTo(0, 0);
}

function renderQuestion() {
  const number = currentIndex + 1;
  document.getElementById("question-count").textContent = `Q ${number} / ${questions.length}`;
  document.getElementById("question-percent").textContent = `${Math.round((currentIndex / questions.length) * 100)}%`;
  const progress = document.querySelector(".progress");
  progress.setAttribute("aria-valuenow", String(currentIndex));
  document.getElementById("question-progress").style.width = `${currentIndex / questions.length * 100}%`;
  const heading = document.getElementById("question-text");
  heading.textContent = questions[currentIndex].text;
  document.querySelectorAll(".answer-button").forEach(button => {
    button.setAttribute("aria-pressed", String(answers[currentIndex] === Number(button.dataset.answer)));
  });
  showScreen("question");
  heading.focus({ preventScroll: true });
}

function calculateResult() {
  const scores = Object.fromEntries(categories.map(category => [category.key, 0]));
  questions.forEach((question, index) => { scores[question.category] += answers[index] ?? 0; });
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const max = Math.max(...Object.values(scores));
  const top = max === 0 ? [] : categories.filter(category => scores[category.key] === max);
  return { scores, total, top };
}

function overallComment(total) {
  if (total <= 5) return "今のところ、大きな違和感は少なめかもしれません。\n\nただ、小さな引っかかりがあるなら、その感覚も大切にしてみてください。";
  if (total <= 10) return "少し「自分より周り」を優先する時間が増えているのかもしれません。\n\n無理に変えなくても、まず気づくだけで十分です。";
  if (total <= 15) return "心の中で「ちょっと疲れたよ」というサインが出ている可能性があります。\n\n特にチェックが多かったところを少し見てみてください。";
  return "かなり長いあいだ、いろいろなことを一人で抱えてきたのかもしれません。\n\nこれ以上頑張ることよりも、今の自分の気持ちを知ることから始めてみてください。";
}

function renderResult() {
  const { scores, total, top } = calculateResult();
  document.getElementById("total-score").innerHTML = `${total} <small>/ ${questions.length}</small>`;
  document.getElementById("overall-comment").textContent = overallComment(total);
  const scoreContainer = document.getElementById("category-scores");
  scoreContainer.replaceChildren();
  categories.forEach(category => {
    const row = document.createElement("div");
    row.className = "category-row";
    const head = document.createElement("div");
    head.className = "category-head";
    const name = document.createElement("span");
    name.textContent = category.name;
    const count = document.createElement("span");
    count.textContent = `${scores[category.key]} / 6`;
    head.append(name, count);
    const track = document.createElement("div");
    track.className = "score-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", category.name);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "6");
    track.setAttribute("aria-valuenow", String(scores[category.key]));
    const fill = document.createElement("div");
    fill.className = "score-fill";
    fill.style.width = `${scores[category.key] / 6 * 100}%`;
    track.append(fill);
    row.append(head, track);
    scoreContainer.append(row);
  });
  const topContainer = document.getElementById("top-categories");
  const messageContainer = document.getElementById("type-messages");
  topContainer.replaceChildren();
  messageContainer.replaceChildren();
  if (top.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "今回は特に反応が多かったところはありませんでした。";
    topContainer.append(empty);
  }
  top.forEach(category => {
    const item = document.createElement("p");
    item.className = "top-item";
    item.textContent = category.name;
    topContainer.append(item);
    const block = document.createElement("section");
    block.className = "type-message";
    const title = document.createElement("h3");
    title.textContent = category.name;
    const message = document.createElement("p");
    message.textContent = category.message;
    block.append(title, message);
    messageContainer.append(block);
  });
  showScreen("result");
}

function copyText() {
  const { top } = calculateResult();
  const reflection = document.getElementById("reflection-text")?.value.trim();
  const lines = ["心の現在地チェックをやってみました。", ""];

  if (top.length) {
    lines.push("今回いちばん反応が多かったのは");
    top.forEach(category => lines.push(`「${category.name.replace(/^[①-⑤]\\s*/, "")}」`));
    lines.push("でした。");
  } else {
    lines.push("今回は、特に反応が多かったところはありませんでした。");
  }

  if (reflection) {
    lines.push("", "今回気になったこと：", reflection);
  } else {
    lines.push("", "うまく言葉にできないけど、少し話してみたいです。");
  }

  return lines.join("\n");
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2400);
}

async function copyResult() {
  const value = copyText();
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(value);
    toast("コピーしました");
  } catch {
    const helper = document.createElement("textarea");
    helper.value = value;
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    toast(copied ? "コピーしました" : "コピーできませんでした");
  }
}

function paintRoundedRect(context, x, y, width, height, radius, color) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split("\n");
  let currentY = y;
  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (!paragraph) {
      currentY += lineHeight * 0.7;
      return;
    }
    let line = "";
    Array.from(paragraph).forEach(char => {
      const testLine = line + char;
      if (context.measureText(testLine).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    if (line) {
      context.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    if (paragraphIndex < paragraphs.length - 1) currentY += lineHeight * 0.25;
  });
  return currentY;
}

async function downloadResultCard() {
  const { scores, top } = calculateResult();
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) { toast("画像を作成できませんでした"); return; }

  context.fillStyle = "#f7f6f2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  paintRoundedRect(context, 55, 55, 970, 1240, 52, "#ffffff");

  context.fillStyle = "#536d58";
  context.font = '700 28px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.fillText("なすぺんと、ひと息つこう", 120, 145);

  context.fillStyle = "#403346";
  context.font = '700 56px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.fillText("心の現在地チェック", 120, 225);

  context.fillStyle = "#59645f";
  context.font = '600 28px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.fillText("今回いちばん反応が多かったところ", 120, 320);

  let y = 390;
  const displayTop = top.length ? top : [];
  if (!displayTop.length) {
    context.fillStyle = "#426d57";
    context.font = '700 40px "Hiragino Sans", "Yu Gothic", sans-serif';
    context.fillText("今回は特にありませんでした", 120, y);
    y += 90;
  } else {
    displayTop.forEach(category => {
      context.fillStyle = "#426d57";
      context.font = '700 44px "Hiragino Sans", "Yu Gothic", sans-serif';
      y = wrapCanvasText(context, category.name, 120, y, 840, 60);
      context.fillStyle = "#6b756f";
      context.font = '600 30px "Hiragino Sans", "Yu Gothic", sans-serif';
      context.fillText(`${scores[category.key]} / 6`, 120, y + 8);
      y += 72;

      context.fillStyle = "#303b38";
      context.font = '500 30px "Hiragino Sans", "Yu Gothic", sans-serif';
      y = wrapCanvasText(context, category.message, 120, y, 840, 48) + 36;
    });
  }

  paintRoundedRect(context, 100, 1170, 880, 72, 20, "#eaf3e8");
  context.fillStyle = "#3d6048";
  context.textAlign = "center";
  context.font = '700 28px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.fillText("気づけたことがひとつあれば十分だよ", 540, 1217);
  context.textAlign = "left";

  try {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("PNG export failed")), "image/png");
    });
    const today = new Date();
    const dateStamp = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `heart-check-result-${dateStamp}.png`;
    link.rel = "noopener";
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 120000);
    toast("結果画像の保存を開始しました");
  } catch (error) {
    console.error("PNG save failed:", error);
    toast("画像を保存できませんでした");
  }
}

function resetAndStart() {
  answers = Array(questions.length).fill(null);
  currentIndex = 0;
  document.getElementById("reflection-text").value = "";
  renderQuestion();
}

document.getElementById("start-button").addEventListener("click", resetAndStart);
document.querySelectorAll(".answer-button").forEach(button => button.addEventListener("click", () => {
  answers[currentIndex] = Number(button.dataset.answer);
  if (currentIndex === questions.length - 1) renderResult();
  else { currentIndex += 1; renderQuestion(); }
}));
document.getElementById("back-button").addEventListener("click", () => {
  if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); }
  else showScreen("start");
});
document.querySelectorAll(".copy-button").forEach(button => button.addEventListener("click", copyResult));
document.getElementById("download-card").addEventListener("click", downloadResultCard);
document.querySelectorAll(".retry-button").forEach(button => button.addEventListener("click", resetAndStart));
document.querySelectorAll(".home-button").forEach(button => button.addEventListener("click", () => {
  answers = Array(questions.length).fill(null);
  currentIndex = 0;
  document.getElementById("reflection-text").value = "";
  showScreen("start");
}));

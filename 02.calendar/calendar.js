// 入力
let input_date = require("minimist")(process.argv.slice(2));

// 日付、曜日などの生成
let year = input_date["y"] || new Date().getFullYear();
let month = input_date["m"] || new Date().getMonth() + 1;
let day_of_week = new Date(year, month - 1, 1).getDay();
let last_day = new Date(year, month, 0).getDate();
let output_date = `${year}年 ${month}月`;

// １行目を中央寄せするための定数
const padding = Math.max(0, (18 - output_date.length) / 2);
const spaces = " ".repeat(padding);
const day_of_week_str = ["日", "月", "火", "水", "木", "金", "土"];

// スペースをつけて中央寄せ
console.log(spaces + output_date + spaces);
console.log(day_of_week_str.join(" "));

// ここから出力処理
// 月初の曜日までスペースで埋める
process.stdout.write("   ".repeat(day_of_week));

for (let day = 1; day <= last_day; day++) {
  // 土曜日になったら改行を入れるための条件分岐
  if (day_of_week == 6) {
    console.log(day.toString());
    day_of_week = 0;
  } else {
    process.stdout.write(day.toString().padEnd(3));
    day_of_week++;
  }
}

// 入力
let input_date = require("minimist")(process.argv.slice(2));

// 日付、曜日などの生成
const year = input_date["y"] || new Date().getFullYear();
const month = input_date["m"] || new Date().getMonth() + 1;
const day_of_week_str = ["日", "月", "火", "水", "木", "金", "土"];
let day_of_week = new Date(year, month - 1, 1).getDay();
let last_day = new Date(year, month, 0).getDate();
let output_date = `${year}年 ${month}月`;

// スペースをつけて中央寄せ
console.log(`     ${output_date}`);
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

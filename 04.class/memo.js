
const { argv } = require('yargs');
process.stdin.resume();
process.stdin.setEncoding('utf8');

let lines = []; ; //標準入力から受け取ったデータを格納する配列
let reader = require('readline').createInterface({//readlineという機能を用いて標準入力からデータを受け取る
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (input_lines) => {//line変数には標準入力から渡された一行のデータが格納されている
  lines.push(input_lines);//ここで、lines配列に、標準入力から渡されたデータが入る
});
reader.on('close', () => {//
  console.log(lines)
  let title = lines[0];
  let content = lines.join('');
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('memos.db');
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS memos (title TEXT, content TEXT)");
    db.run("INSERT INTO memos VALUES (?, ?)", [title, content]);
    db.each("SELECT * FROM memos", (err, memo) => {
      if (err) {
        console.log(err)
      } else {
        console.log(memo);
      }
    });

  });

  db.close();
});



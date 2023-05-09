
const { title } = require('process');
const { argv } = require('yargs');
process.stdin.resume();
process.stdin.setEncoding('utf8');



class Memo {
  constructor(){
    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database('memos.db');
  }

  createTable(){
    return new Promise((resolve, reject) => {
      this.db.run("CREATE TABLE IF NOT EXISTS memos (title TEXT, content TEXT)"), (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      }
    });
  }

  fetchMemoTitles(){
    return new Promise((resolve, reject) => {
      this.db.all("SELECT title FROM memos", (error, memos) => {
        if (error) {
          reject(error);
        } else {
          resolve(memos);
        }
      });
    });
  };

  fetchMemo(title){
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM memos WHERE title = ?", [title], (error, memo) => {
        if(error) {
          reject(error);
        } else {
          resolve(memo)
        }
      });
    });
  }

  async activate(argv){
    if(argv.l){
      
    } else if(argv.r){
      const { Select } = require('enquirer');
      const titles = await this.fetchMemoTitles();
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to see',
        choices: titles
      });

      const memo = prompt.run()
      console.log(memo)
    } else {
      let lines = [];
      let reader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      reader.on('line', (input_lines) => {
        lines.push(input_lines);
      });
      reader.on('close', () => {//
        console.log(lines)
        let title = lines[0];
        let content = lines.join('');
        
        db.serialize(() => {
          
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
    }
  }
}

const memo = new Memo();
memo.activate(argv);
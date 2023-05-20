
const { argv } = require('yargs');
const { spawn } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const filename = "temporary.txt";
const fs = require('fs');
const { Select } = require('enquirer');
// process.stdin.resume();
// process.stdin.setEncoding('utf8');
class Memo {
  constructor(){
    this.db = new sqlite3.Database('memos.db');
    this.createTable()
  }

  createTable(){
    return new Promise((resolve, reject) => {
      this.db.run("CREATE TABLE IF NOT EXISTS memos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE, content TEXT)"), (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      }
    });
  }


  fetchMemos(){
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM memos", (error, memos) => {
        if (error) {
          reject(error);
        } else {
          const question_memo = memos.map((memo) => ({
            id: memo.id,
            title: memo.title,
            content: memo.content
          }));
          resolve(question_memo);
        }
      });
    });
  };

  deleteMemo(title){
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM memos WHERE title = ?", [title], (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  createMemo(title, content){
    return new Promise((resolve, reject) => {
      this.db.run("INSERT INTO memos (title, content) VALUES (?, ?)", [title, content], (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  outputMemo(content){
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, content, (error) => {
        if(error){
          reject(error)
        } else {
          resolve()
        }
      });
    });
  }

  editMemo(){
    return new Promise((resolve, reject) => {
      const vim = spawn('vim', [filename], { stdio: 'inherit' });
      vim.on('exit', (error) => {
        if(error){
          reject(error)
        } else {
          const fs = require('fs');
          const edited_file = fs.readFileSync(filename, 'utf-8');
          const file_rows = edited_file.split('\n').map(line => line);
          resolve(file_rows);
        }
      });
    });
  }

  updateMemo(ex_title, title, content){
    return new Promise((resolve, reject) => {
      this.db.run("UPDATE memos SET title = ?, content = ? WHERE title = ?", [title, content, ex_title], (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }


  async activate(argv){
    if(argv.l){
      const memos = await this.fetchMemos();
      memos.forEach(memo => {
        console.log(memo.title);
      });
    } else if(argv.r){
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to see',
        choices: await this.fetchMemos()
      });
      await prompt.run()
        .then(title => {
          let choice = prompt.choices.find(ch => ch.title === title);
          console.log(choice.content);
        });
    } else if(argv.d){
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to delete',
        choices: await this.fetchMemos()
      });
      const title = await prompt.run();
      await this.deleteMemo(title);
    } else if(argv.e){
      const memos = await this.fetchMemos();
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to edit',
        choices: memos
      });
      const title = await prompt.run();
      const chosen_memo = memos.find(ch => ch.title == title)
      await this.outputMemo(chosen_memo.content);
      const edited_content = await this.editMemo();
      await this.updateMemo(chosen_memo.title, edited_content[0], edited_content.join('\n'));
    } else {
      let lines = [];
      let reader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      reader.on('line', (input_lines) => {
        lines.push(input_lines);
      });
      reader.on('close', async() => {//
        const title = lines[0];
        const content = lines.join('');
        await this.createMemo(title, content);
      });
    }
  }
}

const memo = new Memo();
memo.activate(argv);
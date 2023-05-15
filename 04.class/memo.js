
const { argv } = require('yargs');
process.stdin.resume();
process.stdin.setEncoding('utf8');
const { spawn } = require('child_process');
const filename = "temporary.txt";
class Memo {
  constructor(){
    const sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database('memos.db');
  }

  createTable(){
    return new Promise((resolve, reject) => {
      this.db.run("CREATE TABLE IF NOT EXISTS memos (title TEXT PRIMARY KEY UNIQUE, content TEXT)"), (error) => {
        if(error) {
          reject(error);
        } else {
          resolve();
        }
      }
    });
  }

  showAllMemos(){
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM memos", (error, memos) => {
        if (error) {
          reject(error);
        } else {
          resolve(memos);
        }
      });
    });
  };

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
          resolve(memo);
        }
      });
    });
  }

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
      this.db.run("INSERT INTO memos VALUES (?, ?)", [title, content], (error) => {
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
      const fs = require('fs');
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
      const memos = await this.fetchMemoTitles();
      memos.forEach(memo => {
        console.log(memo.title);
      });
    } else if(argv.r){
      const { Select } = require('enquirer');
      const titles = await this.fetchMemoTitles();
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to see',
        choices: titles
      });
      const title = await prompt.run();
      const chosen_memo = await this.fetchMemo(title);
      console.log(chosen_memo.content);
    } else if(argv.d){
      const { Select } = require('enquirer');
      const titles = await this.fetchMemoTitles();
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to delete',
        choices: titles
      });
      const title = await prompt.run();
      await this.deleteMemo(title);
    } else if(argv.e){
      const { Select } = require('enquirer');
      const titles = await this.fetchMemoTitles();
      const prompt = new Select({
        name: 'memo',
        message: 'Choose a note you want to edit',
        choices: titles
      });
      const title = await prompt.run();
      const chosen_memo = await this.fetchMemo(title);
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
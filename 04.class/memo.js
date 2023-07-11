const { argv } = require("yargs");
const { Select } = require("enquirer");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const FILENAME = "temporary.txt";

class Memo {
  constructor() {
    this.db = new sqlite3.Database("memos.db");
    this.createTable();
  }

  createTable() {
    return new Promise((resolve, reject) => {
      this.db.run(
        "CREATE TABLE IF NOT EXISTS memos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE, content TEXT)"
      ),
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };
    });
  }

  fetchMemos() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM memos", (error, memos) => {
        if (error) {
          reject(error);
        } else {
          const fetchedMemos = memos.map((memo) => ({
            id: memo.id,
            title: memo.title,
            content: memo.content,
          }));
          resolve(fetchedMemos);
        }
      });
    });
  }

  deleteMemo(title) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM memos WHERE title = ?", [title], (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  createMemo(title, content) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO memos (title, content) VALUES (?, ?)",
        [title, content],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  outputMemo(content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(FILENAME, content, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  editMemo() {
    return new Promise((resolve, reject) => {
      const vim = spawn("vim", [FILENAME], { stdio: "inherit" });
      vim.on("exit", (error) => {
        if (error) {
          reject(error);
        } else {
          const fs = require("fs");
          const editedFile = fs.readFileSync(FILENAME, "utf-8");
          const fileRows = editedFile.split("\n").map((line) => line);
          resolve(fileRows);
        }
      });
    });
  }

  updateMemo(exTitle, title, content) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE memos SET title = ?, content = ? WHERE title = ?",
        [title, content, exTitle],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  chooseMemo(memos, messageType) {
    const message = {
      read: "Choose a note you want to see",
      edit: "Choose a note you want to edit",
      delete: "Choose a note you want to delete",
    };
    const prompt = new Select({
      name: "memo",
      message: message[messageType],
      choices: memos,
    });
    return prompt.run().then((title) => {
      const chosenMemo = memos.find((choice) => choice.title == title);
      return chosenMemo;
    });
  }

  async activateMemoApp(argv) {
    try {
      const memos = await this.fetchMemos();
      if (argv.l) {
        memos.forEach((memo) => {
          console.log(memo.title);
        });
      } else if (argv.r) {
        const chosenMemo = await this.chooseMemo(memos, "read");
        console.log(chosenMemo.content);
      } else if (argv.d) {
        const chosenMemo = await this.chooseMemo(memos, "delete");
        await this.deleteMemo(chosenMemo.title);
      } else if (argv.e) {
        const chosenMemo = await this.chooseMemo(memos, "edit");
        await this.outputMemo(chosenMemo.content);
        const editedContent = await this.editMemo();
        await this.updateMemo(
          chosenMemo.title,
          editedContent[0],
          editedContent.join("\n")
        );
      } else {
        let lines = [];
        let reader = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        reader.on("line", (inputLines) => {
          lines.push(inputLines);
        });
        reader.on("close", async () => {
          const title = lines[0];
          const content = lines.join("\n");
          await this.createMemo(title, content);
        });
      }
    } catch (error) {
      console.error("エラーが発生しました。", error);
    }
  }
}

const memo = new Memo();
memo.activateMemoApp(argv);

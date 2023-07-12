import inquirer from "inquirer";
import { spawn } from "child_process";
import sqlite3 from "sqlite3";
import fs from "fs";

const FILENAME = "temporary.txt";

export default class Memo {
  static async createTable() {
    const db = new sqlite3.Database("memos.db");
    return new Promise((resolve, reject) => {
      db.run(
        "CREATE TABLE IF NOT EXISTS memos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE, content TEXT)",
        (error) => {
          if (error) {
            console.log("エラーが発生しました。");
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async fetchMemos() {
    const db = new sqlite3.Database("memos.db");
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM memos", (error, memos) => {
        if (error) {
          console.log("エラーが発生しました。");
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

  async deleteMemo(title) {
    const db = new sqlite3.Database("memos.db");
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM memos WHERE title = ?", [title], (error) => {
        if (error) {
          console.log("エラーが発生しました。");
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async createMemo(title, content) {
    const db = new sqlite3.Database("memos.db");
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO memos (title, content) VALUES (?, ?)",
        [title, content],
        (error) => {
          if (error) {
            console.log("エラーが発生しました。");
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
          console.log("エラーが発生しました。");
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async editMemo() {
    return new Promise((resolve, reject) => {
      const vim = spawn("vim", [FILENAME], { stdio: "inherit" });
      vim.on("exit", (error) => {
        if (error) {
          console.log("エラーが発生しました。");
          reject(error);
        } else {
          const editedFile = fs.readFileSync(FILENAME, "utf-8");
          const fileRows = editedFile.split("\n").map((line) => line);
          fs.unlinkSync(FILENAME);
          resolve(fileRows);
        }
      });
    });
  }

  async updateMemo(exTitle, title, content) {
    const db = new sqlite3.Database("memos.db");
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE memos SET title = ?, content = ? WHERE title = ?",
        [title, content, exTitle],
        (error) => {
          if (error) {
            console.log("エラーが発生しました。");
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

    const choices = memos.map((memo) => ({
      name: memo.title,
      value: memo,
    }));

    const prompt = inquirer.prompt([
      {
        type: "list",
        name: "selectedMemo",
        message: message[messageType],
        choices: choices,
      },
    ]);

    return prompt.then((answers) => answers.selectedMemo);
  }
}

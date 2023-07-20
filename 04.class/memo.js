import { spawn } from "child_process";
import sqlite3 from "sqlite3";
import fs from "fs";

const FILENAME = "temporary.txt";
const DB = new sqlite3.Database("memos.db");

export default class Memo {
  static async createTable() {
    return new Promise((resolve, reject) => {
      DB.run(
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
    return new Promise((resolve, reject) => {
      DB.all("SELECT * FROM memos", (error, memos) => {
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
    return new Promise((resolve, reject) => {
      DB.run("DELETE FROM memos WHERE title = ?", [title], (error) => {
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
    return new Promise((resolve, reject) => {
      DB.run(
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
    return new Promise((resolve, reject) => {
      DB.run(
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
}

import { spawn } from "child_process";
import sqlite3 from "sqlite3";
import fs from "fs";
import tmp from "tmp";

const DB = new sqlite3.Database("memos.db");

export default class Memo {
  #filename;

  constructor() {
    this.#filename = "";
  }

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

  async createTempFile() {
    return new Promise((resolve, reject) => {
      tmp.file((err, path) => {
        if (err) {
          reject(err);
        } else {
          this.#filename = path;
          resolve();
        }
      });
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

  async outputMemo(content) {
    console.log("---!-");
    console.log(this.#filename);
    return new Promise((resolve, reject) => {
      fs.writeFile(this.#filename, content, (error) => {
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
      const vim = spawn(process.env.EDITOR, [this.#filename], {
        stdio: "inherit",
      });
      vim.on("exit", (error) => {
        if (error) {
          console.log("エラーが発生しました。");
          reject(error);
        } else {
          try {
            const editedFile = fs.readFileSync(this.#filename, "utf-8");
            const fileRows = editedFile.split("\n").map((line) => line);
            fs.unlinkSync(this.#filename);
            resolve(fileRows);
          } catch (err) {
            console.error("ファイル読み込みエラー:", err.message);
            reject(err);
          }
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

import Memo from "./memo.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import readline from "readline";
import inquirer from "inquirer";

const memo = new Memo();
await Memo.createTable();
const argv = yargs(hideBin(process.argv)).argv;
const memos = await memo.fetchMemos();

const chooseMemo = (memos, messageType) => {
  if (memos.length == 0) {
    throw new Error("メモがありません。");
  }
  const message = {
    read: "Choose a note you want to see",
    edit: "Choose a note you want to edit",
    delete: "Choose a note you want to delete",
  };

  const choices = memos.map((memo) => ({
    name: memo.title,
    value: memo,
  }));

  try {
    const prompt = inquirer.prompt([
      {
        type: "list",
        name: "selectedMemo",
        message: message[messageType],
        choices: choices,
      },
    ]);
    return prompt.then((answers) => answers.selectedMemo);
  } catch (error) {
    console.log("エラーが発生しました:", error.message);
  }
};

try {
  if (argv.l) {
    memos.forEach((memo) => {
      console.log(memo.title);
    });
  } else if (argv.r) {
    const chosenMemo = await chooseMemo(memos, "read");
    console.log(chosenMemo.content);
  } else if (argv.d) {
    const chosenMemo = await chooseMemo(memos, "delete");
    await memo.deleteMemo(chosenMemo.title);
  } else if (argv.e) {
    const tmpFile = await memo.createTemplateFile();
    const chosenMemo = await chooseMemo(memos, "edit");
    memo.outputMemo(chosenMemo.content, tmpFile.path);
    const editedContent = await memo.editMemo(tmpFile.path);
    memo.updateMemo(
      chosenMemo.title,
      editedContent[0],
      editedContent.join("\n")
    );
    tmpFile.cleanup();
  } else {
    let lines = [];
    let reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    reader.on("line", (inputLines) => {
      lines.push(inputLines);
    });
    reader.on("close", () => {
      if (lines.length > 0) {
        const title = lines[0].trim();
        const content = lines.join("\n");
        if (title !== "") {
          memo.createMemo(title, content);
        } else {
          console.log("入力がありません。");
        }
      } else {
        console.log("入力がありません。");
      }
    });
  }
} catch (error) {
  console.log(error);
}

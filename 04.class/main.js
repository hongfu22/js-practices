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
    const chosenMemo = await chooseMemo(memos, "edit");
    await memo.createTempFile();
    await memo.outputMemo(chosenMemo.content);
    const editedContent = await memo.editMemo();
    await memo.updateMemo(
      chosenMemo.title,
      editedContent[0],
      editedContent.join("\n")
    );
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
      const title = lines[0];
      const content = lines.join("\n");
      memo.createMemo(title, content);
    });
  }
} catch (error) {
  console.log(error);
}

import Memo from "./memo.js"
import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
import rq from "readline"


const memo = new Memo();
await Memo.createTable();
const argv = yargs(hideBin(process.argv)).argv
const memos = await memo.fetchMemos();
if (argv.l) {
  memos.forEach((memo) => {
    console.log(memo.title);
  });
} else if (argv.r) {
  const chosenMemo = await memo.chooseMemo(memos, "read");
  console.log(chosenMemo.content);
} else if (argv.d) {
  const chosenMemo = await memo.chooseMemo(memos, "delete");
  await memo.deleteMemo(chosenMemo.title);
} else if (argv.e) {
  const chosenMemo = await memo.chooseMemo(memos, "edit");
  await memo.outputMemo(chosenMemo.content);
  const editedContent = await memo.editMemo();
  await memo.updateMemo(
    chosenMemo.title,
    editedContent[0],
    editedContent.join("\n")
  );
} else {
  let lines = [];
  let reader = rq.createInterface({
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



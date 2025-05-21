import { execSync } from "node:child_process";
import path from "node:path";
import prompts from "prompts";
import fs from "node:fs";
import util from "util";

// 当前目录
const cwd = process.cwd();
// 默认文件夹
const defaultDir = "hirayura-project";
// 目标目录
let targetDir = defaultDir;
function formatTargetDir(target) {
  return target?.trim().replace(/\/+$/g, "");
}

async function init() {
  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: defaultDir,
      onState: (state) => {
        targetDir = formatTargetDir(state.value) || defaultDir;
      },
    },
    {
      type: "select",
      name: "framework",
      message: "Select a framework:",
      choices: [
        {
          title: "Angular",
          value: "https://github.com/Hirayura/angular-example",
        },
        { title: "Vue3", value: null },
        { title: "Vue2", value: null },
        { title: "React", value: null },
      ],
    },
  ]);
  // 创建项目目录
  const root = path.join(cwd, targetDir);
  const access = util.promisify(fs.access);
  await access(root, fs.constants.F_OK, (err) => {
    const exists = !err;
    if (exists) {
      console.log("directory exists!");
      process.exit(0);
    } else {
      execSync(
        `cd ${cwd} && git clone ${response.framework} ${targetDir} && cd ${root} && pnpm install`
      ).toString();
      console.log("Project created successfully!");
    }
  });
}
// 执行主函数
init().catch((e) => {
  console.error(e);
});

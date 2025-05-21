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
// 项目列表
const projectList = [
  {
    title: "Angular",
    value: "https://github.com/Hirayura/angular-example",
    name: "angular-example",
  },
  { title: "Vue3", value: null },
  { title: "Vue2", value: null },
  { title: "React", value: null },
];
function formatTargetDir(target) {
  return target?.trim().replace(/\/+$/g, "");
}
function formatProjectName(name) {
  return name.split("/").pop();
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
      choices: projectList,
    },
  ]);
  // 创建项目目录
  const root = path.join(cwd, targetDir);
  const access = util.promisify(fs.access);
  await access(root, fs.constants.F_OK, (err) => {
    const exists = !err;
    if (!targetDir) return;
    if (exists) {
      console.log("directory exists!");
      process.exit(0);
    } else {
      execSync(
        `cd ${cwd} && git clone ${response.framework} ${targetDir} && cd ${root} && pnpm install`
      ).toString();
      const projectName = formatProjectName(response.framework);
      processDirectory(root, projectName, targetDir);
      fs.rmSync(path.join(root, ".git"), {
        recursive: true,
        force: true,
      });
      console.log("Project created successfully!");
    }
  });
}
// 执行主函数
init().catch((e) => {
  console.error(e);
});

// 排除的目录
const excludedDirs = ["node_modules", ".git", ".idea", "vendor", ".vscode"];
function processDirectory(dirPath, oldString, newString) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    console.log(file);

    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      if (excludedDirs.includes(file)) {
        // console.log(`Skipping directory: ${filePath}`);
        return;
      }
      processDirectory(filePath, oldString, newString);
    } else {
      const ext = path.extname(filePath).toLowerCase();
      processFile(filePath, oldString, newString);
    }
  });
}

function processFile(filePath, oldString, newString) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const newContent = content.replaceAll(oldString, newString);
    fs.writeFileSync(filePath, newContent, "utf8");
    // console.log(`文件已更新: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

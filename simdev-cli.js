#!/usr/bin/env node
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const exec = require("child_process").exec;
const chalk = require("chalk");
const ora = require("ora");
const program = require("commander");
const currentPath = process.cwd();

const log = console.log;

program
  .version("0.1.0")
  .option("-s, --sim", "Simulator")
  .parse(process.argv);

var selectedDevice = program.args.join(" ");

if (fs.existsSync(currentPath + "/package.json")) {
  deviceList();
} else {
  chalk.red(
    "This Project needs to be initialized for React-Native \n See https://facebook.github.io/react-native/docs/getting-started.html for more details"
  );
}

function deviceList() {
  exec("xcrun simctl list devices --json", (error, stdout, stderr) => {
    const simulators = JSON.parse(stdout);
    if (simulators.devices) {
      const devices = simulators.devices;
      let list = [];
      let copyList = [];

      Object.keys(devices).forEach(function(key, index) {
        const result = devices[key].filter(
          item => item.availability === "(available)"
        );
        list = list.concat(result);
      });

      copyList = list.map((item, index) => {
        return item.name;
      });
      list = list.map((item, index) => {
        return index + 1 + "] -> (" + item.name + ")";
      });

      log(list.join("\n"));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      if (selectedDevice) {
        const yourAnswer = copyList[selectedDevice];
        run(yourAnswer);
      } else {
        rl.question(
          chalk.blue("Select a Device ... i.e 10\nAnd Press Enter\n"),
          answer => {
            const yourAnswer = copyList[answer];
            run(yourAnswer);
            rl.close();
          }
        );
      }
    }
  });
}

function run(param) {
  if (param == null || "undefined") {
    console.log(
      chalk.red("The device number must not be undefined or 0\n") +
        chalk.green("Relisting devices ...")
    );
    // setTimeout(function() {
    //   deviceList();
    // }, 1800);
  } else {
    log(chalk.blue("Starting.... " + param));
    exec(
      'react-native run-ios --simulator="' + param + '"',
      (error, stdout, stderr) => {
        console.log(chalk.red(stdout));
        if (stderr == null) {
          const spinner = ora(chalk.green("Running on Simulator")).start();
        }
        console.log(chalk.blue("Error => ") + chalk.red(stderr));
      }
    );
  }
}

const fs = require("fs");
const path = require("path");

const sourceFile = path.join(__dirname, "..", "chromium-info.json");
const targetFile = path.join(__dirname, "..", "dist", "chromium-info.json");

fs.copyFile(sourceFile, targetFile, (err) => {
  if (err) throw err;
  console.log("chromium-info.json was copied to dist folder");
});

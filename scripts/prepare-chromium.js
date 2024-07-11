const fs = require("fs-extra");
const path = require("path");

function prepareChromium(platform, arch) {
  let sourcePath;
  let folder;
  if (platform === "win32") {
    sourcePath = path.join(__dirname, "..", "chromium", "win64");
    folder = "win64";
  } else if (platform === "darwin") {
    sourcePath = path.join(
      __dirname,
      "..",
      "chromium",
      arch === "arm64" ? "mac-arm64" : "mac-x64"
    );
    if (arch == "arm64") {
      folder = "mac-arm64";
    } else {
      folder = "mac-x64";
    }
  } else {
    throw new Error("Unsupported platform");
  }

  const destPath = path.join(__dirname, "..", "build-chromium");

  // Xóa thư mục đích nếu nó tồn tại
  fs.removeSync(destPath);

  // Copy Chromium phù hợp vào thư mục build
  fs.copySync(sourcePath, destPath + "/" + folder);

  console.log(`Chromium prepared for ${platform}-${arch}`);
}

const platform = process.argv[2];
const arch = process.argv[3];

if (!platform || !arch) {
  console.error("Usage: node prepare-chromium.js <platform> <arch>");
  process.exit(1);
}

prepareChromium(platform, arch);

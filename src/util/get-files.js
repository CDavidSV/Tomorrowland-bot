const fs = require("fs");
const path = require("path");

/**
 * Gets all files from a particular directory and extention.
 * @param dir 
 * @param ext 
 */
const getFiles = (dir, ext, handler) => {
    if (!(/\.([a|A-z|Z]|\d)+$/g).test(ext)) { // Test to check if the file extention is a valid one.
        throw new Error(`Invalid extention: ${ext}`);
    };

    const filesInDir = fs.readdirSync(dir); // Get all files in current directory.
    let files = [];

    filesInDir.forEach((file) => {
        const filePath = path.join(dir, file);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            files = [...files,  ...getFiles(filePath, ext, handler)]; // Get all files in subdirectory.
        } else if (path.extname(filePath) === ext) {
            files.push(path.resolve(filePath));
            console.log(`[GET-FILES][${handler}] - File ${path.basename(filePath)} was loaded successfully`.yellow);
        }
    });

    return files;
}

module.exports = getFiles;
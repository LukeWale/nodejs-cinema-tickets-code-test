import { promises as fs } from "fs";

const getFileContentsHelper = async (filePath) => {
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    return fileContents;
  } catch (err) {
    return err;
  }
};

export default getFileContentsHelper;

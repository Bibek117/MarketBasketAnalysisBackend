import multer from "multer";

let fileName;
const dynamicStorage = (basePath) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, basePath);
    },
    filename: function (req, file, cb) {
      fileName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname.trim();
      cb(null, fileName);
    },
  });

export { dynamicStorage ,fileName};

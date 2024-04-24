const fastify = require("fastify")({ logger: true });
const dotenv = require("dotenv");
const port = process.env.PORT || 3003;
const multipart = require("@fastify/multipart");
const fs = require("fs");
const { pipeline } = require("stream");

fastify.register(multipart);

fastify.post("/upload", async (req, reply) => {
  const { file } = await req.file();
  console.log("file:",file.filename);

  if (!file) {
    reply.code(400).send({ message: "Dosya bulunamadı." });
    return;
  }
  const targetPath = `./uploads/${file.filename}`;

  try {
    await pipeline(
      fs.createReadStream(file.tempFilePath),
      fs.createWriteStream(targetPath)
    );
    return { filename: file.filename };
  } catch (err) {
    console.error("\n Dosya kaydedilirken hata oluştu:", err);
    reply.code(500).send({ message: "Dosya kaydedilirken bir hata oluştu." });
  }
});

const start = async () => {
  try {
    await fastify.listen(port);
    console.log("server bağlantısı başarılı");
  } catch (err) {
    console.log("server bağlantısı başarısız");
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

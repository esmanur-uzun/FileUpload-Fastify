import Fastify from "fastify";
import multipart from "@fastify/multipart";
import fs from "fs";
import util from "util";
import { pipeline } from "stream";
import fastifyStatic from "@fastify/static";
const port = process.env.PORT || 3003;

const pump = util.promisify(pipeline);

export const app = Fastify({
  logger: true,
});

app.register(multipart);

app.post("/upload", async (req, reply) => {
  const data = await req.file();
  if (!data) {
    reply.code(400).send({ message: "Dosya bulunamadı." });
    return;
  }
  const targetPath = `./uploads/${data.filename}`;

  try {
    await pump(data.file,fs.createWriteStream(`./uploads/${data.filename}`));
    const fileUrl = `${req.protocol}://${req.hostname}/uploads/${data.filename}`;
    return { message: "Dosya başarıyla yüklendi ve kaydedildi.",fileUrl };
  } catch (err) {
    console.error("Dosya kaydedilirken hata oluştu:", err);
    reply.code(500).send({ message: "Dosya kaydedilirken bir hata oluştu." });
  }
  console.log(data.tempFilePath);
  return { message: "dosya yüklendi" };
});

// Upload edilen dosyaların dışarıya erişilebilir hale getirilmesi
app.register(fastifyStatic, {
  root: 'C:\\Users\\pc\\Desktop\\fastify\\uploads', // Dosyaların bulunduğu dizin
  prefix: '/uploads' // Dışarıya erişim için kullanılacak URL öneki
});


const start = async () => {
  try {
    await app.listen({ port }); // Değişiklik: Listen yöntemi değiştirildi
    console.log("Server bağlantısı başarılı. Port:", port);
  } catch (err) {
    console.error("Server bağlantısı başarısız:", err);
    process.exit(1);
  }
};

start();

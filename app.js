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

// tekli dosya yükleme

app.post("/upload", async (req, reply) => {
  const data = await req.file();
  if (!data) {
    reply.code(400).send({ message: "Dosya bulunamadı." });
    return;
  }

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

// çoklu doysa yükleme

// app.post("/upload", async (req, reply) => {
//   const parts = req.files();
//   if (!parts) {
//     reply.code(400).send({ message: "Dosyalar bulunamadı" });
//     return;
//   }
//   try {
//     const uploadedFiles = [];
//     for await (const part of parts) {
      
//       await pump(part.file, fs.createWriteStream(`./uploads/${part.filename}`));
//       const fileUrl = `${req.protocol}://${req.hostname}/uploads/${part.filename}`;
//       uploadedFiles.push({ filename: part.filename, url: fileUrl });
      
//     }
//     return { message: "Dosyalar başarıyla yüklendi ve kaydedildi",uploadedFiles };
//   } catch (err) {
//     console.error("Dosya yüklenirken bir hata oluştu: ",err)
//     reply.code(500).send({message:"Dosya kaydedilirken bir hata oluştu"})
//   }
//   return { message: "yükleme başarılı" };
// });

// Upload edilen dosyaların dışarıya erişilebilir hale getirilmesi
app.register(fastifyStatic, {
  root: "C:\\Users\\pc\\Desktop\\fastify\\uploads", // Dosyaların bulunduğu dizin
  prefix: "/uploads", // Dışarıya erişim için kullanılacak URL öneki
});

const start = async () => {
  try {
    await app.listen({ port });
    console.log("Server bağlantısı başarılı. Port:", port);
  } catch (err) {
    console.error("Server bağlantısı başarısız:", err);
    process.exit(1);
  }
};

start();

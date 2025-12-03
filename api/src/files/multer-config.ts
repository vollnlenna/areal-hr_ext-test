import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

type MulterConfig = Parameters<
  typeof import('@nestjs/platform-express').FileInterceptor
>[1];

export const multerFilesConfig: MulterConfig = {
  storage: diskStorage({
    destination: (req, file: Express.Multer.File, cb) => {
      const dir = join(process.env.STORAGE_DIR!, '');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file: Express.Multer.File, cb) => {
      const uuid = randomUUID();
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uuid}${ext}`);
    },
  }),
  limits: {
    fileSize: 10485760,
  },
  fileFilter: (req, file: Express.Multer.File, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый тип файла'), false);
    }
  },
};

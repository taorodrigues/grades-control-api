import express from 'express';
import winston from 'winston';
import gradesRouter from './routes/grades.js';
import { promises as fileSystem } from 'fs';

const { readFile, writeFile } = fileSystem;

global.fileName = 'grades.json';

const app = express();
app.use(express.json()); // tells express library I am using json
app.use('/grades-control-api', gradesRouter); // I can set the api name here

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grades-control-api.log' }),
  ],
  format: combine(
    label({ label: 'grades-control-api' }),
    timestamp(),
    myFormat
  ),
});

// runs the api on this port
app.listen(3000, async () => {
  try {
    global.logger.info('API Started!');
  } catch (err) {
    logger.error(err);
  }
});

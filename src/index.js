const http = require('http');
const path = require('path');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const EventEmitter = require('events');
const search = require('./search/index');
const scanner = require('./scanner/index');
const queue = require('./queue/index');
const logger = require('./logger/index');
const database = require('./database/index');
const indexer = require('./indexer/index');
const localConfig = require('./config.json');
const redis = require('redis');
const { promisify } = require('util');
const { corsOptions } = localConfig;
const serverPath = path.dirname(require.main.filename);
localConfig.serverPath = serverPath;

let readyState = 0;

const client = (process.env.DOCKER) ? 
  redis.createClient(6379, 'redis') : 
  redis.createClient();

// promisify redis-lib get method
client.get = promisify(client.get).bind(client);

// create application instance
const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
// set static path
app.use(express.static(path.join(serverPath, '../public')));


const events = new EventEmitter();

// event for check app ready state
events.on('app.ready', () => {
  readyState++;
  if (readyState < localConfig.moduleCount) return false;
  events.emit('send.logger', { emit: 'logFile', args: { 
    message: 'App started with no error', 
  }});
  events.emit('postinit');
});
const payloads = { events, CONFIG: localConfig, redis: client };
// connect module configurations
const db = database(payloads);
payloads.db = db;
indexer(payloads);
logger(payloads);
scanner(payloads);
(process.env.DOCKER) ? setTimeout(()=>queue(payloads), 10000) : 
queue(payloads);
const router = search(payloads);


events.on('postinit', () => {
  events.emit('scanner.scanDirectory');
  events.emit('database.model');
});

app.use('/', router);

// Create server and listen port
const port = process.env.PORT || localConfig.port || 8080;

server.listen(port, '0.0.0.0', () =>
  console.log(`API running at :${port} port`));

events.emit('app.ready');


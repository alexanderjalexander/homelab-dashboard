import { Db, MongoClient } from 'mongodb';
import { primaryMongoConfig } from './settings.js';

let _connection: MongoClient;
let _db: Db;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(primaryMongoConfig.serverUrl);
    _db = _connection.db(primaryMongoConfig.database);
  }

  return _db;
};
const closeConnection = async () => {
  await _connection!.close();
};

export {dbConnection, closeConnection};
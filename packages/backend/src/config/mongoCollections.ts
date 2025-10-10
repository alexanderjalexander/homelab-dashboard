import type { Collection, Document } from 'mongodb';
import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection_name:string) => {
  let _col:Collection<Document>;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = db.collection(collection_name);
    }

    return _col;
  };
};

export const users = getCollectionFn('users');
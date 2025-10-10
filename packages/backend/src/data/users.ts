import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helper from '../helpers.js';
import * as bcrypt from "bcrypt";

const salt_rounds = 12;

export type userDocument = {
    _id: string,
    username: string,
    hashedPassword: string,
    admin: boolean,
}

async function getUserById (id:string): Promise<userDocument> {
    id = helper.checkIdString(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (user === null) throw new Error("No user found with the given ID.");
    // @ts-ignore
    return {
        ...user,
        _id: user._id.toString()
    };
}

async function getUserByUsername (username:string): Promise<userDocument> {
    username = helper.checkUsername(username);
    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (user === null) throw new Error("No user found with the given username.");
    // @ts-ignore
    return {
        ...user,
        _id: user._id.toString()
    };
}

async function loginUser(username:string, password:string): Promise<userDocument> {
    username = helper.checkUsername(username);
    password = helper.checkPassword(password);

    const userCollection = await users();
    const foundUser = await userCollection.findOne({username: username});
    if (!foundUser) throw new Error('Either the username or password is invalid');
    const pswdMatch = await bcrypt.compare(password, foundUser.hashedPassword);
    if (!pswdMatch){
        throw new Error('Either the username or password is invalid');
    }
    // @ts-ignore
    return {
        _id: foundUser._id.toString(),
        username: foundUser.username
    }
};

async function createUser(
    username:string,
    password:string,
    admin:boolean,
):Promise<userDocument> {
    username = helper.checkUsername(username);
    password = helper.checkPassword(password);
    if (admin === undefined || admin === null || typeof(admin) !== "boolean") {
        throw new Error("`admin` is not of type boolean.");
    }

    const userCollection = await users();
    const foundUsername = await userCollection.findOne({username: username});
    if (foundUsername) throw new Error('there is already a user with that username');

    password = helper.checkPassword(password);
    const hashed = await bcrypt.hash(password, salt_rounds);
    const newUser = {
        username: helper.checkUsername(username),
        hashedPassword: hashed,
        admin: admin,
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw new Error('Could not add user');
    const newId = insertInfo.insertedId.toString();
    const user = await getUserById(newId);
    return user;
}

export default {
    getUserById,
    getUserByUsername,
    createUser,
    loginUser,
}
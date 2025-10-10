import {ObjectId} from 'mongodb';

export const admin_user_key = "ADMIN_USERNAME";
export const admin_pw_key = "ADMIN_PASSWORD";
export const admin_hpw_key = "ADMIN_HASHEDPASSWORD";

export function checkString(str:string, name:string) {
    if (typeof str !== 'string') throw `Error: ${name} must be a string`;
    if (str.trim().length === 0)
        throw `Error: ${name} cannot be an empty string or just spaces`;
    return str.trim();
}

export function checkIdString(id:string) {
    id = checkString(id, 'id')
    id = id.toLowerCase();
    if (!ObjectId.isValid(id)) throw new Error("Invalid object ID - must be a 24-char hex string.")
    return id;
}

export const checkUsername = (username:string) => {
    username = checkString(username, 'username');
    username = username.toLowerCase();
    if (username.length < 2) {
        throw new Error('Username must be >= 2 characters in length.');
    }
    if (/ /.test(username)) {
        throw new Error('Username cannot contain spaces.');
    }
    return username;
}

export const checkPassword = (password:string) => {
    password = checkString(password, 'password');
    if (!password || typeof(password) !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
    }
    return password;
}

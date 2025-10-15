
const helper = require('../helper');
const config = require('../dbConfig');

async function getAllUsers() {
    const users = await db.query('SELECT * FROM users');
    const data = helper.emptyOrData(users);
    return { data };
}

async function getSingleById(uid) {
    const row = await db.query(`SELECT * FROM users WHERE id = ${uid}`);
    const data = helper.emptyOrData(row);
    return { data };
}

async function getSingleByUsername(username) {
    const row = await db.query(`SELECT * FROM users WHERE email = ${username}`);
    const data = helper.emptyOrData(row);
    return { data };
}

async function insertUser(user) {
    try {
        const query = "INSERT INTO users (firstName, lastName, email, pwHash, needsPwUpdate, avatarUrl, balance) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [user.firstName, user.lastName, user.email, user.pwHash, user.needsPwUpdate, user.avatarUrl, user.balance];
        const result = await db.query(query, values);
        return { result };
    } catch (error) {
        console.error(`Error adding user: ${error}`);
        throw error;
    }
}

module.exports = {
    getAllUsers,
    getSingleById,
    getSingleByUsername,
    insertUser
};

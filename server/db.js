
const sqlite3 = require('sqlite3').verbose();

class DB {

    constructor(path) {
        this.db = new sqlite3.Database(path)
        this.init();
    }

    init() {

        this.db.serialize(() => {
            this.db
                .exec('PRAGMA foreign_keys = ON;', function (err) { /*console.log("foreign keys supported: ", !err, this)*/ })
                .run(`CREATE TABLE IF NOT EXISTS users(
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    email TEXT NOT NULL UNIQUE,
                    salt TEXT,
                    token TEXT,
                    validated INTEGER DEFAULT 0,
                    json TEXT
                    )`)
                .run(`CREATE TABLE IF NOT EXISTS entities(
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    userId INTEGER NOT NULL,  
                    type text,
                    json TEXT,
                    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
                    )`);
        });
    }

    updateEntity(userId, entity) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE entities SET json = ? WHERE id = ? AND userId = ?'
            // console.log(sql, entity)
            this.db.run(sql, [JSON.stringify(entity), entity.id, userId],
                function(err) {
                    // console.log("update", err, this.changes)
                    if (err) reject(err.message);
                    else if (this.changes !== 1) reject("Not updated");
                    else resolve(entity)
                });
        });
    }

    createEntity(userId, type, entity) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO entities (userId, type, json) VALUES (?, ?, ?)'
            this.db.run(sql, [userId, type, JSON.stringify(entity)],
                function (err) { // lambda functions don't get a "this", and I need it for lastID
                    // console.log("INSERT", err)
                    if (err) {
                        reject(err);
                    } else resolve({ ...entity, id: this.lastID }); // this.lastID = last ID
                });
        })
    }
    removeEntity(userId, entityId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM entities WHERE userId = ? AND id = ?'
            // console.log(sql, entityId)
            this.db.run(sql, [userId, entityId],
                function(err) {
                    if (err) reject(err.message);
                    else if (this.changes !== 1) reject("No such entity")
                    else resolve(entityId);
                });
        })
    }

    getEntity(userId, id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT json FROM entities WHERE userId = ? AND id = ?'
            // console.log("running", sql)
            this.db.get(sql, [userId, id],
                (err, row) => {
                    // console.log("got entity", err, row)
                    if (err) {
                        console.log("err", err.message)
                        reject(err.message);
                    } else {
                        if (row) resolve(JSON.parse(row.json));
                        else {
                            reject("Not found")
                        }
                    }
                });
        })
    }

    getAllEntities(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM entities WHERE userId = ?' // where User is...
            console.log("running", sql)
            this.db.all(sql, [userId],
                (err, rows) => {
                    if (err) {
                        console.log("err", err.message)
                        reject(err.message);
                    } else {
                        if (rows) {
                            resolve(rows.map(row => {
                                var obj = JSON.parse(row.json);
                                obj.id = row.id;
                                return obj;
                            }));
                        } else {
                            resolve([])
                        }
                    }
                });
        })
    }

    getAllEntitiesByType(userId, type) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM entities WHERE userId = ? AND type = ?' // where User is...
            console.log("running", sql)
            this.db.all(sql, [userId, type],
                (err, rows) => {
                    if (err) {
                        console.log("err", err.message)
                        reject(err.message);
                    } else {
                        if (rows) {
                            resolve(rows.map(row => {
                                var obj = JSON.parse(row.json);
                                obj.id = row.id;
                                return obj;
                            }));
                        } else {
                            resolve([])
                        }
                    }
                });
        })
    }


    createUser(user) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO users (email, json, salt, token) VALUES (?, ?, ?, ?)'
            const token = "randomToken" + Math.floor(Math.random()*1000);
            this.db.run(sql, [user.email, JSON.stringify(user), user.salt, user.hashedPassword],
                function (err) { // lambda functions don't get a "this", and I need it for lastID
                    // console.log("INSERT", err)
                    if (err) {
                        reject(err.message);
                    } else resolve({ ...user, id: this.lastID }); // this.lastID = last ID
                });
        })
    }

    validateUser(user) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, json FROM users WHERE email = ? AND token = ?'
            console.log("running", sql)
            this.db.get(sql, [user.email, user.hashedPassword],
                (err, row) => {
                    console.log("got user", err, row)
                    if (err) {
                        console.log("err", err.message)
                        reject(err.message);
                    } else if (!row) { 
                        console.log("no such user")
                        reject("Not found");

                    } else {
                        console.log("row", row)

                        var theUser = JSON.parse(row.json) ;
                        theUser.id = row.id;

                        if (row) resolve(theUser);
                        else {
                            console.log("invalid login")
                            reject("Not found")
                        }
                    }
                });
        })
    }    

    updateUserProfile(userId, email, userProfile) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE users SET json = ?, email = ? WHERE id = ?'
            this.db.run(sql, [JSON.stringify(entity), email, userId],
                err => {
                    if (err) reject(err.message);
                    else resolve(entity)
                });
        });
    }

    deleteUser(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?'
            console.log(sql, entityId)
            this.db.run(sql, [userId],
                err => {
                    if (err) reject(err.message);
                    else resolve(userId);
                });
        })
    }

}

module.exports = { DB }
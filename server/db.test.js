var datalayer = require('./db');
var fs = require('fs')

const DB_TEST_FILE = './testcase.db'
var db = null;
var TEST_USER = {};
var TEST_USER_ID = -99;
var TEST_ENTITY = null;

const TYPE = 'TEST_TYPE';
const AN_ENTITY = { name: 'test' };


beforeAll(async () => {
    // console.log("beforeAll", user)
    try {
        fs.unlinkSync(DB_TEST_FILE)
    } catch (err) {
        // ignore
    }
    db = new datalayer.DB(DB_TEST_FILE);
    var user = await db.createUser({ email: 'testuser', hashedPassword: 'hashedPass' });
    TEST_USER_ID = user.id;
    TEST_USER = user;
    // console.log("beforeAll", user)
    TEST_ENTITY = await db.createEntity(TEST_USER_ID, TYPE, AN_ENTITY)
});

afterAll(() => {
    // console.log("cleaning")
    try {
        fs.unlinkSync(DB_TEST_FILE)
    } catch (err) {
    }
});


describe('create', () => {

    it('create without existing user shall fail', async () => {
        // console.log("usier", TEST_USER);
        try {
            const result = await db.createEntity(4598, TYPE, AN_ENTITY);
            expect(2).toBe(1); // should not happen!
        } catch (err) {
            expect(err.errno).toBe(19); // constraint
        }
    })

    it('create without id shall add id', async () => {
        const result = await db.createEntity(TEST_USER_ID, TYPE, AN_ENTITY);
        expect(result.id).not.toBeNull();
    })


    it('create shall create persistent entity', async () => {
        const newName = "new name"
        const entity = await db.createEntity(TEST_USER_ID, TYPE, { name: "any" })
        const fetchedEntity = await db.getEntity(TEST_USER_ID, entity.id);
        expect(entity.name).toBe(fetchedEntity.name);
        
    })

});

describe('update', () => {

    it('update with wrong user shall fail', async () => {
        // console.log("usier", TEST_USER);
        try {
            const random_user = -1;
            // console.log("entity", TEST_ENTITY)
            const result = await db.updateEntity(random_user, TEST_ENTITY);
            expect(2).toBe(1); // should not happen!
        } catch (err) {
            // console.log("error", err)
            expect(err).toBe("Not updated"); // constraint
        }
    })

    it('update shall update json', async () => {
        const newName = "new name"
        const result = await db.updateEntity(TEST_USER_ID, { ...TEST_ENTITY, name: newName } );
        expect(result.name).toBe(newName);
    })

    it('update shall update json partially too', async () => {
        const newName = "newer name"
        const result = await db.updateEntity(TEST_USER_ID, { id:TEST_ENTITY.id, address: "address" } );
        // console.log("result is", result)
        expect(result.name).not.toBeNull();
        expect(result.address).toBe("address");
    })

});

describe('delete', () => {

    it('delete on wrong user shall fail', async () => {
        // console.log("usier", TEST_USER);
        try {
            const random_user = -1;
            const result = await db.removeEntity(random_user, TEST_ENTITY.id);
            expect(2).toBe(1); // should not happen!
        } catch (err) {
            expect(err).toBe("No such entity"); // constraint
        }
    })


    it('delete shall delete entity', async () => {
        const newName = "new name"
        const entity = await db.createEntity(TEST_USER_ID, TYPE, TEST_ENTITY)
        expect(entity.name).toBe(TEST_ENTITY.name);

        removeResult = await db.removeEntity(TEST_USER_ID, entity.id);
        try { 
            const result = await db.getEntity(TEST_USER_ID, entity.id);
            expect(1).toBe(2);
        } catch (err) { 
            expect(err).toBe("Not found");
        }
    })

});
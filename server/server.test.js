const { json } = require('body-parser');
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:8111'
const headers = { 'Content-Type': 'application/json' }
const testUser = { email: "test", hashedPassword: "test" }

it ('should be done', () => {
    fetch(baseUrl+'/')
    .then(res => {
        expect(res.status).toBe(404)
    })
})

it ('whoami without login should fail', async () => {
    const result = await fetch(baseUrl+'/whoami')
    .then(res => {
        expect(res.status).toBe(401)
    })
    // console.log(result)
})

test ('user delete', async () => {

    const result = await fetch(baseUrl+'/user', 
        {method:'delete', body: JSON.stringify(testUser), headers})
        
        .then(result => {
            expect(result.status).toBe(200);
        })

})




const request = require('supertest');
const md5 = require('md5');
const mongoose = require('mongoose');
const Article = require('../src/articleSchema');
const User = require('../src/userSchema');
const app = require('../index');

describe('Article Tests', function() {
    let user;
    let article;

    beforeEach(async function() {
        await User.deleteMany({});
        await Article.deleteMany({});

        const salt = 'random_salt';
        const hash = md5(salt + 'password123');

        user = new User({
            username: 'testUser',
            salt: salt,
            hash: hash,
            email: 'test@gmail.com',
            dob: new Date('1999-01-01'),
            phone: '1234567890',
            zipcode: '12345'
        });

        await user.save();

        article = new Article({
            author: 'testUser',
            text: 'Test article content'
        });

        await article.save();
    });

    afterEach(async function() {
        await User.deleteMany({});
        await Article.deleteMany({});
    });

    async function login() {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'testUser',
                password: 'password123'
            });

        if (response.status !== 200) {
            throw new Error('Does not log in');
        }

        return response.headers['set-cookie'][0].split(';')[0];
    }

    it('GET /articles should returns articles of logged in user', async function() {
        const cookie = await login();

        const response = await request(app)
            .get('/articles')
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
    });

    it('GET /articles/:id should retrieve a single article by id', async function() {
        const cookie = await login();
        const articleId = article._id.toString();

        const response = await request(app)
            .get(`/articles/${articleId}`)
            .set('Cookie', cookie);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(jasmine.objectContaining({
            author: 'testUser',
            text: 'Test article content'
        }));
        expect(response.body._id).toEqual(articleId);
    });

    it('POST /article should create a new article', async function() {
        const cookie = await login();

        const articleData = {
            text: 'New article text',
        };

        const response = await request(app)
            .post('/article')
            .set('Cookie', cookie)
            .send(articleData);

        expect(response.status).toBe(201);
    });
});

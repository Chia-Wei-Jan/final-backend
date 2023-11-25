const request = require('supertest'); 
const md5 = require('md5');
const mongoose = require('mongoose');
const User = require('../src/userSchema');
const Profile = require('../src/profileSchema'); 
const auth = require('../src/auth'); 
const app = require('../index'); 

describe('Auth Tests', function() {
    let userFindOneSpy;
    let userSaveSpy;
    let profileSaveSpy;
  
    beforeEach(async function() {
      await User.deleteMany({});
      await Profile.deleteMany({});
  
      userFindOneSpy = spyOn(User, 'findOne').and.returnValue({
        exec: jasmine.createSpy('exec').and.callFake((conditions) => {
          return Promise.resolve(conditions.username === 'existingUser' ? mockUser : null);
        })
      });
  
      userSaveSpy = spyOn(User.prototype, 'save').and.callFake(() => Promise.resolve(mockUser));
      profileSaveSpy = spyOn(Profile.prototype, 'save').and.callFake(() => Promise.resolve(mockProfile));
  

      spyOn(auth, 'isLoggedIn').and.callFake((req, res, next) => {
        req.username = 'testUser'; 
        next(); 
      });
    });
  
    afterEach(function() {
      jasmine.clock().uninstall();
      userFindOneSpy.and.stub();
      userSaveSpy.and.stub();
      profileSaveSpy.and.stub();
    });
  
    it('POST /register should register a new user', async function() {    
        const response = await request(app)
          .post('/register')
          .send({
            username: 'newuser10',
            email: 'asd987@gmail.com',
            dob: '1999-04-11',
            phone: '123-456-7890',
            zipcode: '12345',
            password: 'password123'
          });
    
        expect(response.status).toEqual(409);
        expect(response.body).toEqual(jasmine.objectContaining({
          result: 'success',
          username: 'newuser'
        }));
      });
  
    it('POST /login should log in a user', function(done) {
      request(app)
        .post('/login')
        .send({
          username: 'testUser',
          password: 'password123'
        })
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(jasmine.objectContaining({
            result: 'Login successful',
            username: 'testUser'
          }));
          done();
        })
        .catch((err) => done.fail(err));
    });
  
    it('PUT /logout should log out a user', function(done) {
      request(app)
        .post('/login')
        .send({
          username: 'testUser',
          password: 'password123'
        })
        .then((res) => {
          expect(res.status).toEqual(200);

          const cookie = res.headers['set-cookie'][0].split(';')[0];

          return request(app).put('/logout').set('Cookie', cookie).send();
        })
        .then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(jasmine.objectContaining({
            result: 'OK'
          }));
          done();
        })
        .catch((err) => done.fail(err));
    });
});

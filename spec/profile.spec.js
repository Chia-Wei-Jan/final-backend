const request = require('supertest');
const md5 = require('md5');
const User = require('../src/userSchema');
const Profile = require('../src/profileSchema');
const app = require('../index');

describe('Profile Tests', () => {
  let user;
  let profile;

  beforeEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});

    const salt = 'random_salt';
    const hash = md5(salt + 'password123');

    user = new User({
        username: 'testUser',
        salt: salt,
        hash: hash,
        email: 'test@example.com',    
        dob: new Date('1990-01-01'),  
        phone: '1234567890',           
        zipcode: '12345'               
      });
    await user.save();

    profile = new Profile({
      username: 'testUser',
      headline: 'Initial headline',
    });
    await profile.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});
  });

  async function login() {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testUser',
        password: 'password123'
      });
    
    if (response.status !== 200) {
      throw new Error('Failed to log in');
    }

    return response.headers['set-cookie'][0].split(';')[0];
  }

  it('GET /headline should retrieve the headline for the logged-in user', async () => {
    const cookie = await login();

    const response = await request(app)
      .get('/headline')
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      username: 'testUser',
      headline: 'Initial headline'
    });
  });

  it('PUT /headline should update the headline for the logged-in user', async () => {
    const cookie = await login();
    const newHeadline = 'Updated headline';

    const response = await request(app)
      .put('/headline')
      .set('Cookie', cookie)
      .send({ headline: newHeadline });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      username: 'testUser',
      headline: newHeadline
    });
  });
});
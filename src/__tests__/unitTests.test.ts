import request from 'supertest';
import app from '../app';

describe('GET /address/:address', () => {
  it('should return 200 OK with the correct response body when given a valid address', async () => {
    const response = await request(app).get('/address/0x369052fE460cf5D3AE7e87451C8b4b867bDa493B');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: expect.any(String),
      address: '0x369052fE460cf5D3AE7e87451C8b4b867bDa493B',
      balance: '299675136166298345',
      current_block: expect.any(Number),
      txs: expect.any(Array),
      __v: expect.any(Number),
    });
  });

  it('should return 404 Bad Request with an error message when given an invalid address', async () => {
    const response = await request(app).get('/address/invalid_address');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Address not supported!');
  });

describe('POST /sendEther/:amount', () => {
  it('should return 200 OK with the correct response body when given a valid amount', async () => {
    const response = await request(app).post('/sendEther/0.001');
    expect(response.status).toBe(200);
    expect(response.text).toEqual('Ether sent successfully!');
  });

  it('should return 400 Bad Request with an error message when given an invalid amount', async () => {
    const response = await request(app).post('/sendEther/0');
    expect(response.status).toBe(400);
    expect(response.text).toBe('Amount must be greater than 0');
  });
});
});
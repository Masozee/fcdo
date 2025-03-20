import * as db from './db';

// Mock the database functions
jest.mock('./db', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  execute: jest.fn()
}));

describe('Database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute a query', async () => {
    const mockResult = [{ id: 1, name: 'Test' }];
    (db.query as jest.Mock).mockResolvedValue(mockResult);

    const result = await db.query('SELECT * FROM test');
    
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM test');
    expect(result).toEqual(mockResult);
  });

  it('should execute a query and return first result', async () => {
    const mockResult = { id: 1, name: 'Test' };
    (db.queryOne as jest.Mock).mockResolvedValue(mockResult);

    const result = await db.queryOne('SELECT * FROM test WHERE id = 1');
    
    expect(db.queryOne).toHaveBeenCalledWith('SELECT * FROM test WHERE id = 1');
    expect(result).toEqual(mockResult);
  });

  it('should execute a command', async () => {
    (db.execute as jest.Mock).mockResolvedValue(true);

    const result = await db.execute('CREATE TABLE test (id INT)');
    
    expect(db.execute).toHaveBeenCalledWith('CREATE TABLE test (id INT)');
    expect(result).toBe(true);
  });
}); 
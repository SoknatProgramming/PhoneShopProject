import bcrypt from 'bcrypt';
import db from '../database';
import User from '../types/users.type';
import config from '../config';

console.log(config);
const hashPassword = (hashPass: string) => {
  const salt = parseInt(config.salt as string, 10);
  return bcrypt.hashSync(`${hashPass}${config.pepper}`, salt);
};
class UserModel {
  //create user
  async create(u: User): Promise<User> {
    try {
      //open connection with DB
      const connection = await db.connect();
      const sql = `INSERT INTO users (email, user_name, first_name, last_name, password) 
      values ($1, $2, $3, $4, $5) returning id, email, user_name, first_name,last_name`;
      //run query
      const result = await connection.query(sql, [
        u.email,
        u.first_name,
        u.user_name,
        u.last_name,
        hashPassword(u.password),
      ]);
      //release connection
      connection.release();
      //return create user
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Unable to create (${u.user_name}): ${(error as Error).message}`,
      );
    }
  }
  // get all users
  async getMany(): Promise<User[]> {
    try {
      //open connection with DB
      const connection = await db.connect();
      const sql =
        'SELECT id, email, user_name, first_name, last_name from users';
      //run query
      const result = await connection.query(sql);
      //release connection
      connection.release();
      //return create user
      return result.rows;
    } catch (error) {
      throw new Error(`Error at retrieving users ${(error as Error).message}`);
    }
  }
  // get specific user
  async getOne(id: string): Promise<User> {
    try {
      //open connection with DB
      const connection = await db.connect();
      const sql =
        'SELECT id, email, user_name, first_name, last_name from users where id=($1)';
      //run query
      const result = await connection.query(sql, [id]);
      //release connection
      connection.release();
      //return create user
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Error at retrieving users ${id}, ${(error as Error).message}`,
      );
    }
  }
  // update user
  async updateOne(u: User): Promise<User> {
    try {
      const connection = await db.connect();
      const sal =
        'UPDATE users SET email=$1, user_name=$2, first_name=$3, last_name=$4, password=$5 WHERE id=$6 RETURNING id, email, user_name, first_name, last_name';
      const result = await connection.query(sal, [
        u.email,
        u.user_name,
        u.first_name,
        u.last_name,
        hashPassword(u.password),
        u.id,
      ]);
      connection.release();
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Could not update user: ${u.user_name}, ${(error as Error).message}`,
      );
    }
  }
  //delete user
  async deleteOne(id: string): Promise<User> {
    try {
      //open connection with DB
      const connection = await db.connect();
      const sql =
        'delete from users WHERE id=($1) RETURNING id, email, user_name, first_name, last_name';
      //run query
      const result = await connection.query(sql, [id]);
      //release connection
      connection.release();
      //return create user
      return result.rows[0];
    } catch (error) {
      throw new Error(
        `Could not delete user: ${id}, ${(error as Error).message}`,
      );
    }
  }
  // authenticate user
  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const connection = await db.connect();
      const sql = 'SELECT password FROM users WHERE email=$1';
      const result = await connection.query(sql, [email]);
      if (result.rows.length) {
        const { password: hashPassword } = result.rows[0];
        const isPasswordValid = bcrypt.compareSync(
          `${password}${config.pepper}`,
          hashPassword,
        );
        if (isPasswordValid) {
          const userInfo = await connection.query(
            'SELECT id, email, user_name, first_name, last_name FROM users WHERE email=($1)',
            [email],
          );
          return userInfo.rows[0];
        }
      }
      connection.release();
      return null;
    } catch (error) {
      throw new Error(`Unable to login: ${(error as Error).message}`);
    }
  }
}
export default UserModel;

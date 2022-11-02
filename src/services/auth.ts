import bcrypt from 'bcrypt'

export default class AuthService {
  public static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
  
  public static async comparePasswords(password: string, hashedPassord: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassord);
  }
}

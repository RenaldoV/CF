export interface IUser {
  passwordHash: string;
  _id?: string;
  email: string;
  role: string;
  name: string;
  surname: string;
  forgotPassword?: {
    token: string;
    expiry: Date;
  };
  fileIDs?: [string];
}


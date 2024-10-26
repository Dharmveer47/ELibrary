export interface IReqBody {
  name: string;
  email: string;
  password: string;
}

export interface IUser extends IReqBody {
  _id: string;
}
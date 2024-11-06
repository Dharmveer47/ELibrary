import { IUser } from "../../user/types/controller";

export interface IBook {
    _id: string;
    title: string;
    author: IUser;
    genre: string;
    coverImage: string;
    file: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
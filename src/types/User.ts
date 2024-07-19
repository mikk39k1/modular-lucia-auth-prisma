import { Session } from "lucia";

export type User = {
    id?: string;
    username: string;
    hashed_password: string;
    role: string;
    sessions: Session[];
};
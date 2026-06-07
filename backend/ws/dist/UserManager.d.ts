import { WebSocket } from "ws";
import { User } from "./User";
export declare class UserManager {
    private Users;
    private static instance;
    private constructor();
    static getInstance(): UserManager;
    addUser(ws: WebSocket): User;
    registerOnclose(socket: WebSocket, id: string): void;
    getUser(id: string): User | undefined;
}
//# sourceMappingURL=UserManager.d.ts.map
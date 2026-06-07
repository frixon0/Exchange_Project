import { WebSocket } from "ws";
import { OutgoingMessage } from "./types/out";
export declare class User {
    private ws;
    private id;
    constructor(socket: WebSocket, id: string);
    emit(message: OutgoingMessage): void;
    addListeners(): void;
}
//# sourceMappingURL=User.d.ts.map
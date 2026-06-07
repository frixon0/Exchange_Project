"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const in_1 = require("./types/in");
const SubManager_1 = require("./SubManager");
class User {
    ws;
    id;
    constructor(socket, id) {
        this.ws = socket;
        this.id = id;
        this.addListeners();
    }
    emit(message) {
        this.ws.send(JSON.stringify(message));
    }
    addListeners() {
        this.ws.on("message", (message) => {
            const parsedmessage = JSON.parse(message);
            if (parsedmessage.method === in_1.SUBSCRIBE) {
                parsedmessage.params.forEach(s => SubManager_1.SubManager.getInstance().subscribe(this.id, s));
            }
            if (parsedmessage.method === in_1.UNSUBSCRIBE) {
                parsedmessage.params.forEach(s => SubManager_1.SubManager.getInstance().unsubscribe(this.id, s));
            }
        });
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map
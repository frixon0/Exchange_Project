"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const User_1 = require("./User");
const SubManager_1 = require("./SubManager");
class UserManager {
    Users = new Map();
    static instance;
    constructor() {
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new UserManager();
            return this.instance;
        }
    }
    addUser(ws) {
        const id = getrandomId();
        const user = new User_1.User(ws, id);
        this.Users.set(id, user);
        this.registerOnclose(ws, id);
        return user;
    }
    registerOnclose(socket, id) {
        socket.on('close', () => {
            this.Users.delete(id);
            // unsubcribe logic
            SubManager_1.SubManager.getInstance().leftuser(id);
        });
    }
    getUser(id) {
        return this.Users.get(id);
    }
}
exports.UserManager = UserManager;
function getrandomId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
//# sourceMappingURL=UserManager.js.map
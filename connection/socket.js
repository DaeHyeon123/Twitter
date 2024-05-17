import { Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import {config} from '../config.js';

//포트번호가 다르기때문에 소켓에서 포트번호설정을 '*'로 설정해서 모든 포트 사용가능하게 설정
class Socket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*'
            }
        })
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if(!token){
                return next(new Error('인증 에러'))
            }
            jwt.verify(token, cofig.jwt.secretKey, (error, decoded) => {
                if(error){
                    return next(new Error('인증 에러'));
                }
                next();
            });
        });
        this.io.on('connection', (socket) => {
            console.log('클라이언트 접속');
        });
    }
}
let socket;
export function initSocket(server){
    if(!socket){
        socket = new Socket();
    }
}
export function getSocketIo(){
    if(!socket){
        throw new Error('먼저 init을 실행하세요');
    }
    return socket.io;
}
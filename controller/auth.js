import * as authRepository from '../data/auth.js';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const secret = 'abc123';

async function makeToken(id){
    const token = jwt.sign({
        id: id,
        isAdmin: false
    }, secret, {expiresIn: '1h'})
    return token;
}

// 회원가입(id, password, username 입력) 함수 (데이터를 추가)
export async function signup(req, res, next){
    const {username, password, name, email} = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const users = await authRepository.createUser(username, hashed, name, email);
    if(users){
        res.status(201).json(users);
    }
}

export async function login(req, res, next){
    const {username, password} = req.body;
    const user = await authRepository.login(username);
    if(user){
        if(bcrypt.compareSync(password, user.password)){
            res.status(201).header('Token', makeToken(username)).json(`${username} 로그인 완료`);
        }else{
            res.status(404).json({message: `${username}의 아이디 또는 비밀번호 확인해주세요`})
        }
    }else{
        res.status(404).json({message: `${username}의 아이디 또는 비밀번호 확인해주세요`})
    }
}

export async function verify(req,res,next){
    const token = req.header['Token'];
    if(token){
        res.status(200).json(token);
    }
}
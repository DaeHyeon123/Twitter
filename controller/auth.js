import * as authRepository from '../data/auth.js';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { config } from '../config.js';
const secret = 'abcd1234%^&*';
// 0502 추가
const jwtExpiresInDays = '2d';
const bcryptSaltRounds = 10;   //파일로 나중에 뺄 예정
// 0502 주석처리
// async function makeToken(id){
//     const token = jsonwebtoken.sign({
//         id: id,
//         isAdmin: false
//     }, secret, {expiresIn: '1h'})
//     return token;
// };
// 0502 추가
function createJwtToken(id){
    // return jsonwebtoken.sign({id}, secret, {expiresIn: jwtExpiresInDays})
    return jsonwebtoken.sign({id}, config.jwt.secretKey, {expiresIn: config.jwt.expiresIn})  // 0503 수정
}
// 회원가입(username, password, name, email 입력) 함수 (데이터를 추가)
export async function signup(req, res, next){
    const {username, password, name, email, url} = req.body;
    //0502 수정
    const found = await authRepository.findByUsername(username);
    if(found){
        return res.status(409).json({message:`${username}이 이미 있습니다`});
    }
    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);  // 0503 수정
    const userId = await authRepository.createUser({username, hashed, name, email, url});
    const token = createJwtToken(userId); //토큰박스 얻어냄
    res.status(201).json({token, username});
}
export async function login(req, res, next){
    const {username, password} = req.body;
    // 0502 수정
    // const user = await authRepository.login(username);
    const user = await authRepository.findByUsername(username);
    if(!user){
        return res.status(401).json({message: `아이디를 찾을 수 없음`});
    }
    const isValidpassword = await bcrypt.compareSync(password, user.password);
    if(!isValidpassword){
        return res.status(401).json({message: `비밀번호가 틀렸음`});
    }
    const token = createJwtToken(user.id);
    res.status(200).json({token, username});
    // 0502 수정 end
    // if(user){
    //     if(bcrypt.compareSync(password, user.password)){
    //         // res.status(201).json(`${username} 로그인 완료`);
    //         res.status(201).header('Token', createJwtToken(username)).json(`${username} 로그인 완료`);
    //     }else{
    //         res.status(404).json({message: `${username}의 아이디 또는 비밀번호 확인해주세요`})
    //     }
    // }
}
// export async function verify(req, res, next){
//     const token = req.body['Token'];
//     if(token){
//         res.status(200).json(token);
//     }
// }
// 0502 추가
export async function me(req, res, next){
    const user = await authRepository.findById(req.userId);
    if(!user){
        return res.status(404).json({message:`일치하는 사용자가 없음`});
    }
    res.status(200).json({token: req.token, username: user.username});
}
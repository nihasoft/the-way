import * as http from 'http'
import { Observable, from } from 'rxjs';

export class RestClientService {

    public getUserTenants(port: number, token: string): Observable<any> {
        const options = {
            hostname: '127.0.0.1',
            port: port,
            path: '/api/user/1/tenants',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }
          
        return from(new Promise((resolve, reject) =>  {
            const req = http.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                
                res.on('data', d => {
                    resolve(JSON.parse(d.toString()));
                })
            })
            
            req.on('error', error => {
                reject(error);
            })
            req.end();
        }));
    }
    public signIn(port: number): Observable<any> {
        const data = JSON.stringify({
            "username": "Hanor",
            "password": "LaLaLaLaLau"
        });
        const options = {
            hostname: '127.0.0.1',
            port: port,
            path: '/api/sign/in',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }
        
        return from(new Promise((resolve, reject) =>  {
            const req = http.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                
                res.on('data', d => {
                    resolve(JSON.parse(d.toString()));
                })
            })
            
            req.on('error', error => {
                reject(error)
            })
            req.write(data)
            req.end()
        }));
    }
}
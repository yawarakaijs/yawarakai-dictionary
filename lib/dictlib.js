const Crypto = require("crypto-js");
const qs = require('querystring');
const axios = require('axios');

const key = Crypto.enc.Utf8.parse("ceh[Een,3d3o9neg}fH+Jx4XiA0,D1cT");
const iv = Crypto.enc.Utf8.parse("K+\\~d4,Ir)b$=paf");
const signkey = "3be65a6f99e98524e21e5dd8f85e2a9b";

const hujiang = {
    search(word, from='cn', to='jp') {
        return new Promise((resolve,reject) => {
            axios.post('https://dict.hjapi.com/v10/dict/'+ from + "/" + to, qs.stringify({
                word: word,
                type: 1
            }), {
                headers: {
                'hujiang-appkey': 'b458dd683e237054f9a7302235dee675',
                'hujiang-appsign': this.signature(from,to,word)
            }
            }).then(res => {
                let _data = res.data;
                if (_data.status !== 0) {
                    return reject(res.data)
                }
                let decrypt = this.decrypt(_data.data);
                resolve(decrypt);
            }).catch(err => {
                reject(err);
            });
        });
    },
    signature(fromLang, toLang, word, wordExt) {
        let build = qs.stringify({
            FromLang: fromLang,
            ToLang: toLang,
            Word: word,
            Word_Ext: wordExt
        }, null, null, {
            encodeURIComponent: qs.unescape
        });
        return Crypto.MD5(build + signkey).toString()
    },
    decrypt(encrypted) {
        let decrypted = Crypto.AES.decrypt(encrypted,key,{
            iv: iv,
            mode: Crypto.mode.CBC,
            padding: Crypto.pad.Pkcs7
        });
        let stringfy_to_utf8 = Crypto.enc.Utf8.stringify(decrypted);
        return JSON.parse(stringfy_to_utf8);
    }
}
module.exports = hujiang;
// Dependecies
let Compo = require('../../../component')

// Component Method
let hujiang = require('./lib/dictlib')

// Header

let thumb = "https://i.loli.net/2019/10/04/eNxTQaftWrh7Lsd.jpg"

// Main

let main = {
    async c2j (query) {
        return hujiang.search(query, 'cn', 'jp').then(res => {
            if (res.wordEntries) {
                return res.wordEntries[0].dictEntrys[0].partOfSpeeches[0].definitions
            }
            if (res.networkEntry) {
                return res.networkEntry
            }
        }).catch(err => {
            Compo.Interface.Log.Log.fatal(err)
        })
    },

    async j2c (query) {
        return hujiang.search(query, 'jp', 'cn').then(res => {
            if (res.wordEntries) {
                return res.wordEntries[0].dictEntrys[0].partOfSpeeches[0].definitions
            }
            if (res.networkEntry) {
                let result = [{ value: res.networkEntry.content }]
                return result
            }
        }).catch(err => {
            Compo.Interface.Log.Log.fatal(err)
        })
    },
    answer (ctx, query, result, middleWord) {
        var data = {
            type: "article",
            id: ctx.inlineQuery.id,
            title: `${query} 的${middleWord}释义`,
            description: result,
            thumb_url: thumb,
            input_message_content: { message_text: `${query} 的${middleWord}是 ${result}` }
        }
        return data
    },
    answerPlain (ctx, query, result, middleWord) {
        var data = {
            type: "article",
            id: ctx.inlineQuery.id,
            title: `${query} 的${middleWord}纯文本`,
            description: result,
            thumb_url: thumb,
            input_message_content: { message_text: `${result}` }
        }
        return data
    }
}

var any = {}

// Exports

exports.commands = {

}

exports.inlines = {
    async dictionary (ctx) {
        // Send in
        var queryPlain = ctx.inlineQuery.query
        var defination
        var defs = new Array()

        // let global = /((^(中文|日语|日文|汉语)((的)|()))(.*)|(^(.*)((的)|()))(中文|日语|汉语|日文)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        let c2jpattern = /((^(日文|日语)((的)|()))(.*)|(^(.*)((的)|()))(日文|日语)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        let j2cpattern = /((^(中文|汉语)((的)|()))(.*)|(^(.*)((的)|()))(中文|汉语)((是什么呢|是什么|是什么意思|怎么说)|()))$/gum
        // Translate to Japanese
        if (c2jpattern.test(queryPlain)) {
            var stepone = queryPlain.replace(/^(日文|日语)(的|())\s{0,}/gu, "")
            var steptwo = stepone.replace(/(是什么|是什么呢|怎么说|怎么写|怎么翻译|)(\?|)$/gu, "")
            if (steptwo != "") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 发起了单词查询 (中文至日文)：${steptwo}`)
                return main.c2j(steptwo).then(res => {
                    defination = res
                    defination.map(element => {
                        defs.push(main.answer(ctx, steptwo, element.value, "日语"))
                        defs.push(main.answerPlain(ctx, steptwo, element.value, "日语"))
                    })
                    return defs
                }).catch(err => {
                    return undefined
                })
            }
        }

        // Translate to Chinese
        if (j2cpattern.test(queryPlain)) {
            var stepone = queryPlain.replace(/^(中文|汉语)(的|())\s{0,}/gu, "")
            var steptwo = stepone.replace(/(是什么|是什么呢|怎么说|怎么写|怎么翻译|)(\?|)$/gu, "")
            if (steptwo != "") {
                Compo.Interface.Log.Log.info(`${ctx.from.first_name} 发起了单词查询 (日文至中文)：${steptwo}`)
                return main.j2c(steptwo).then(res => {
                    defination = res
                    defination.map(element => {
                        defs.push(main.answer(ctx, steptwo, element.value, "中文"))
                        defs.push(main.answerPlain(ctx, steptwo, element.value, "日语"))
                    })
                    return defs
                }).catch(err => {
                    return undefined
                })
            }
        }

        return undefined
    }
}

exports.register = {
    // As the example to Yawarakai Compos
    commands: [
        // { 
        //     function: 'c2j' 
        // },
        // { 
        //     function: "j2c" 
        // }
    ],
    inlines: [
        { function: "dictionary" }
    ],
    messages: [
        // { }
    ]
}
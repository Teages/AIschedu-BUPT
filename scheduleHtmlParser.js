function scheduleHtmlParser(html) {
    //除函数名外都可编辑
    //传入的参数为上一步函数获取到的html
    //可使用正则匹配
    //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://juejin.im/post/5ea131f76fb9a03c8122d6b9
    //以下为示例，您可以完全重写或在此基础上更改

    // 结果存储
    let classes = []
    let timeTable = []

    // HTML 解析, 抓取表格
    let innerHTML = unescape($("#kbtable tbody").html().replace(/&#x(.+?);/g, function(_, $1) {
        return "%u" + $1
    }))

    // 解析课表
    let scheduleTexts = innerHTML.replace(/<input(.*?)>/g,'').replace(/id="(.*?)"/g,'').replace(/class="(.*?)"/g,'').replace(/\n/g,'').replace(/\t/g,'').match(/<tr>([\w\W]*?)<\/tr>/g)
    for (let section in scheduleTexts) {
        let tds = scheduleTexts[section].match(/<td.*?>([\w\W]*?)<\/td>/g)
        let th = scheduleTexts[section].match(/<th.*?>([\w\W]*?)<\/th>/g)
        
        // 课程数据
        for (let week_p in tds) {
            if (tds[week_p].match(/<div.*?>([\w\W]*?)<\/div>/g)) {
                let classHTML = tds[week_p].match(/<div.*?>([\w\W]*?)<\/div>/g)[1]
                let classInfoHTML = classHTML.split("<br>")
                if (classHTML && classInfoHTML.length > 2){
                    let classInfoTexts = {
                        name: "",
                        position: "",
                        teacher: "",
                        weeks: [],
                        day: week_p *1 + 1,
                        sections: []
                    }
                    for (infoHTML of classInfoHTML) {
                        if (infoHTML.indexOf("周次(节次)") > -1) {
                            classInfoTexts.weeks = getWeek($(infoHTML).text())
                            classInfoTexts.sections = getSections($(infoHTML).text())
                        } else if (infoHTML.indexOf("老师") > -1) {
                            classInfoTexts.teacher = $(infoHTML).text()
                        } else if (infoHTML.indexOf("教室") > -1) {
                            classInfoTexts.position = $(infoHTML).text()
                        } else {
                            classInfoTexts.name = $(infoHTML).text()
                        }
                    }
                    addClass(classInfoTexts)
                }
            }
        }
        
        // 时间表解析
        let newtime = th[0].match(/([0-2][0-9]:[0-5][0-9])-([0-2][0-9]:[0-5][0-9]?)/)
        if (newtime) {
            console.log(newtime)
            timeTable.push({
                "section": timeTable.length + 1,
                "startTime": newtime[0].split('-')[0],
                "endTime": newtime[0].split('-')[1]
            })
        }
    }

    // 去重
    function addClass(newClass) {
        for (let oldClass of classes) {
            if (oldClass.name === newClass.name
                && oldClass.weeks[0] === newClass.weeks[0]
                && oldClass.sections[0].section === newClass.sections[0].section) {
                    return false
                }
        }
        classes.push(newClass)
        return true
    }

    // 解析: 周
    function getWeek(text) {
        let week = []
        for (let subTime of text.split("(周)")[0].split(',')) {
            let begin = subTime.split('-')[0]
            let end = subTime.split('-')[1]
            if (!end) {
                end = begin
            }
            for (let j = begin*1; j <= end*1; j++) {
                week.push(j)
            }

        }
        return week
    }
    // 解析: 节
    function getSections(text) {
        let sections = []
        let sectionsTexts = text.match(/\[(.*?)节\]/)[0].replace(/\[(.*?)节\]/, function(_, $1) {
            return $1
        }).split('-')
        for (let i of sectionsTexts) {
            sections.push({
                section: i*1
            })
        }
        return sections
    }


    // 时间表备用方案
    if (timeTable.length <= 0) {
        timeTable = [
            {
                "section": 1,
                "startTime": "08:00",
                "endTime": "08:45"
            },
            {
                "section": 2,
                "startTime": "08:50",
                "endTime": "09:35"
            },
            {
                "section": 3,
                "startTime": "09:50",
                "endTime": "10:35"
            },
            {
                "section": 4,
                "startTime": "10:40",
                "endTime": "11:25"
            },
            {
                "section": 5,
                "startTime": "11:30",
                "endTime": "12:15"
            },
            {
                "section": 6,
                "startTime": "13:00",
                "endTime": "13:45"
            },
            {
                "section": 7,
                "startTime": "13:50",
                "endTime": "14:35"
            },
            {
                "section": 8,
                "startTime": "14:45",
                "endTime": "15:30"
            },
            {
                "section": 9,
                "startTime": "15:40",
                "endTime": "16:25"
            },
            {
                "section": 10,
                "startTime": "16:35",
                "endTime": "17:20"
            },
            {
                "section": 11,
                "startTime": "17:25",
                "endTime": "18:10"
            },
            {
                "section": 12,
                "startTime": "18:30",
                "endTime": "19:15"
            },
            {
                "section": 13,
                "startTime": "19:20",
                "endTime": "20:05"
            },
            {
                "section": 14,
                "startTime": "20:10",
                "endTime": "20:55"
            }
        ]

    }
    return { courseInfos: classes, sectionTimes: timeTable }
}
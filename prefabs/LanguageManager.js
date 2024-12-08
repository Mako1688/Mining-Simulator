export const translations = {
    en: {
        title: "Mining Simulator",
        collectResources: "Collect Resources",
        save: "Save",
        load: "Load",
        file: "File",
        file1: "File 1",
        file2: "File 2",
        file3: "File 3",
        back: "Back",
        undo: "Undo",
        redo: "Redo",
        playerStats: "Player Stats",
        resources: "Resources",
        turns: "Turns",
        buildingsPlaced: "Buildings Placed",
        actions: "Actions",
        buyDrill: "Buy Drill",
        buyExcavator: "Buy Excavator",
        buyDemolitionPlant: "Buy Demolition Plant",
        startNextRound: "Start Next Round",
        collect: "Collect",
        win: "You Win!",
        buildingsPlacedStat: "Buildings Placed",
        resourcesCollected: "Resources Collected",
        turnsPlayed: "Turns Played",
        collectGoal: "Collect {goal} Resources to Win!",
        level: "Level",
        Empty: "Empty",
        location: "Location",
        sunLevel: "Sun Level",
        waterLevel: "Water Level",
        Drill: "Drill",
        Excavator: "Excavator",
        DemolitionPlant: "Demolition Plant",
        level3BuildingsGoal: "Get {goal} Buildings to Level 3 to Win!",
        specificBuildingGoal: "Plant {goal} {buildingType} to Win!",
        langEn: "English",
        langAr: "Arabic",
        langZh: "Chinese",
        drought: "Drought",
    },
    ar: {
        title: "محاكي التعدين",
        collectResources: "جمع الموارد",
        save: "حفظ",
        load: "تحميل",
        file: "ملف",
        file1: "ملف 1",
        file2: "ملف 2",
        file3: "ملف 3",
        back: "رجوع",
        undo: "تراجع",
        redo: "إعادة",
        playerStats: "إحصائيات اللاعب",
        resources: "الموارد",
        turns: "الأدوار",
        buildingsPlaced: "المباني الموضوعة",
        actions: "الإجراءات",
        buyDrill: "شراء الحفار",
        buyExcavator: "شراء الحفار",
        buyDemolitionPlant: "شراء مصنع الهدم",
        startNextRound: "بدء الجولة التالية",
        collect: "جمع",
        win: "لقد فزت!",
        buildingsPlacedStat: "المباني الموضوعة",
        resourcesCollected: "الموارد المجمعة",
        turnsPlayed: "الأدوار التي تم لعبها",
        collectGoal: "اجمع {goal} مورد للفوز!",
        level: "المستوى",
        Empty: "فارغ",
        location: "الموقع",
        sunLevel: "مستوى الشمس",
        waterLevel: "مستوى الماء",
        Drill: "حفار",
        Excavator: "حفار",
        DemolitionPlant: "مصنع الهدم",
        level3BuildingsGoal: "احصل على {goal} مباني إلى المستوى 3 للفوز!",
        specificBuildingGoal: "زرع {goal} {buildingType} للفوز!",
        langEn: "الإنجليزية",
        langAr: "العربية",
        langZh: "الصينية",
        drought: "جفاف",
    },
    zh: {
        title: "采矿模拟器",
        collectResources: "收集资源",
        save: "保存",
        load: "加载",
        file: "文件",
        file1: "文件 1",
        file2: "文件 2",
        file3: "文件 3",
        back: "返回",
        undo: "撤销",
        redo: "重做",
        playerStats: "玩家统计",
        resources: "资源",
        turns: "回合",
        buildingsPlaced: "放置的建筑",
        actions: "操作",
        buyDrill: "购买钻机",
        buyExcavator: "购买挖掘机",
        buyDemolitionPlant: "购买拆除厂",
        startNextRound: "开始下一轮",
        collect: "收集",
        win: "你赢了!",
        buildingsPlacedStat: "放置的建筑",
        resourcesCollected: "收集的资源",
        turnsPlayed: "玩的回合",
        collectGoal: "收集{goal}资源以获胜!",
        level: "等级",
        Empty: "空的",
        location: "位置",
        sunLevel: "太阳等级",
        waterLevel: "水等级",
        Drill: "钻机",
        Excavator: "挖掘机",
        DemolitionPlant: "拆除厂",
        level3BuildingsGoal: "将{goal}个建筑物升至3级以获胜!",
        specificBuildingGoal: "种植{goal}个{buildingType}以获胜!",
        langEn: "英语",
        langAr: "阿拉伯语",
        langZh: "中文",
        drought: "干旱",
    },
};
export class LanguageManager {
    static currentLanguage = "en";
    static setLanguage(language) {
        this.currentLanguage = language;
        this.updateText();
    }
    static getTranslation(key, params) {
        let translation = translations[this.currentLanguage][key] || key;
        if (params) {
            Object.keys(params).forEach((param) => {
                translation = translation.replace(`{${param}}`, String(params[param]));
            });
        }
        return translation;
    }
    static updateText() {
        document.querySelectorAll("[data-translate]").forEach((element) => {
            const key = element.getAttribute("data-translate");
            if (key) {
                element.textContent = this.getTranslation(key);
            }
        });
        // Update language buttons
        document.getElementById("lang-en").textContent = this.getTranslation("langEn");
        document.getElementById("lang-ar").textContent = this.getTranslation("langAr");
        document.getElementById("lang-zh").textContent = this.getTranslation("langZh");
    }
}

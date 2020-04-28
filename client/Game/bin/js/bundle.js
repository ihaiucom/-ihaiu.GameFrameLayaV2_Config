(function () {
    'use strict';

    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Laya.Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            var scene = Laya.stage.addChild(new Laya.Scene3D());
            var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
            camera.transform.translate(new Laya.Vector3(0, 3, 3));
            camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
            var directionLight = scene.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
            var box = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
            var material = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/layabox.png", Laya.Handler.create(null, function (tex) {
                material.albedoTexture = tex;
            }));
            box.meshRenderer.material = material;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class LangType {
        static toLang(httpLang) {
            httpLang = httpLang.replace("-", "_").toLowerCase();
            if (httpLang.indexOf("en") != -1)
                httpLang = LangType.en;
            {
                let has = false;
                for (let v in LangType) {
                    if (v == httpLang) {
                        has = true;
                        break;
                    }
                }
                if (!has) {
                    httpLang = LangType.en;
                }
            }
            return httpLang;
        }
    }
    LangType.zh_cn = "zh_cn";
    LangType.zh_tw = "zh_tw";
    LangType.en = "en";

    class ConfigApi {
        static setFguiStringSource(lang) {
            if (this.callFguiSetStringsSource) {
                this.callFguiSetStringsSource(lang);
            }
        }
        static get loadResAsyncFun() {
            if (this.callLoadResAsync) {
                return this.callLoadResAsync;
            }
            else {
                return this.loadResAsync;
            }
        }
        static async loadResAsync(path, type) {
            return new Promise((resolve) => {
                Laya.loader.load(path, Laya.Handler.create(null, (res) => {
                    Laya.timer.frameOnce(1, null, () => {
                        resolve(res);
                    });
                }), null, type);
            });
        }
        static get configRootPath() {
            if (this.callConfigRootPath) {
                return this.callConfigRootPath();
            }
            return "res/config/";
        }
    }

    class BaseConfigRender {
        constructor() {
            this.configs = new Map();
        }
        getConfigList() {
            var list = [];
            this.configs.forEach((config, key) => {
                list.push(config);
            });
            return list;
        }
        get configList() {
            return this.getConfigList();
        }
        getConfig(id) {
            if (!this.configs.has(id)) {
                console.log(`${this.tableName} 没有 id=${id} 的配置`);
            }
            return this.configs.get(id);
        }
        addConfig(config) {
            this.configs.set(config.id, config);
        }
        getConfigPath() {
            return ConfigApi.configRootPath + `csv/${this.tableName}.csv`;
        }
        load(configLoader, onComplete) {
        }
        reload(configLoader, onComplete) {
        }
        onGameLoadedAll() {
        }
        clear() {
            this.configs.clear();
        }
    }

    class CsvConfigRender extends BaseConfigRender {
        constructor() {
            super(...arguments);
            this.csvDelimiter = "\t";
            this.csvSeparatorReplace = null;
            this.csvLineSeparatorReplace = "|n|";
            this.headTypes = new Map();
            this.headKeyEns = new Map();
            this.headKeyFields = new Map();
            this.headKeyCns = new Map();
        }
        ReplaceSpearator(txt) {
            if (this.tableName == "TextFgui" && txt.indexOf(this.csvLineSeparatorReplace) != -1) {
                var a = 1;
            }
            txt = txt.replace(/\|n\|/g, "\n");
            txt = txt.replace(/\r/g, "");
            return txt;
        }
        load(configLoader, onComplete) {
            configLoader.loadConfig(this.getConfigPath(), (txt, path) => {
                this.parse(txt);
                if (onComplete) {
                    onComplete(this);
                }
                configLoader.unloadConfig(this.getConfigPath());
            });
        }
        reload(configLoader, onComplete) {
            this.clear();
            this.load(configLoader, onComplete);
        }
        clear() {
            this.headTypes.clear();
            this.headKeyEns.clear();
            this.headKeyFields.clear();
            this.headKeyCns.clear();
            super.clear();
        }
        parse(txt) {
            if (txt == null) {
                console.error(`${this.tableName}: txt=${txt}`);
                return;
            }
            let lines = txt.split('\n');
            let line;
            let csv;
            line = lines[0];
            csv = line.split(this.csvDelimiter);
            this.ParseHeadTypes(csv);
            line = lines[1];
            csv = line.split(this.csvDelimiter);
            this.ParseHeadKeyCN(csv);
            line = lines[2];
            csv = line.split(this.csvDelimiter);
            this.ParseHeadKeyEN(csv);
            for (let i = 3; i < lines.length; i++) {
                line = lines[i];
                if (isNullOrEmpty(line))
                    continue;
                csv = line.split(this.csvDelimiter);
                for (let j = 0; j < csv.length; j++) {
                    csv[j] = this.ReplaceSpearator(csv[j]);
                }
                this.ParseCsv(csv);
            }
        }
        ParseHeadTypes(csv) {
            let key;
            for (let i = 0; i < csv.length; i++) {
                key = csv[i];
                if (!isNullOrEmpty(key)) {
                    key = key.trim();
                    this.headTypes.set(i, key);
                }
            }
        }
        ParseHeadKeyCN(csv) {
            let key;
            for (let i = 0; i < csv.length; i++) {
                key = this.ReplaceSpearator(csv[i]);
                if (!isNullOrEmpty(key)) {
                    key = key.trim();
                    this.headKeyCns.set(i, key);
                }
            }
        }
        ParseHeadKeyEN(csv) {
            let key;
            for (let i = 0; i < csv.length; i++) {
                key = csv[i];
                if (!isNullOrEmpty(key)) {
                    key = key.trim();
                    if (this.headKeyEns.has(key)) {
                        console.error(`${this.tableName}: ParseHeadKeyEN 已经存在key= ${key},  i = ${i}`);
                    }
                    this.headKeyEns.set(key, i);
                    this.headKeyFields.set(i, key);
                }
            }
        }
        ParseCsv(csv) {
        }
        GetHeadType(index) {
            return this.headTypes.get(index);
        }
        GetHeadField(index) {
            return this.headKeyFields.get(index);
        }
        GetHeadIndex(enName) {
            if (this.headKeyEns.has(enName)) {
                return this.headKeyEns.get(enName);
            }
            console.error(`${this.tableName}: headKeyEns[${enName}] = -1`);
            return -1;
        }
        onGameLoadedAll() {
        }
    }

    class BaseConfig {
    }

    class LangConfig extends BaseConfig {
        constructor() {
            super(...arguments);
            this.dict = new Map();
        }
    }

    class ConfigFieldType {
    }
    ConfigFieldType.MString = "string";
    ConfigFieldType.MStringArray = "string[]";

    class LangConfigReader extends CsvConfigRender {
        constructor(tableName) {
            super();
            this.lang = "zh_cn";
            this.tableName = tableName;
        }
        getConfigPath() {
            return `config/lang/${this.lang}/${this.tableName}.csv`;
        }
        get headKeyFieldList() {
            if (!this._headKeyFieldList) {
                this._headKeyFieldList = [];
                this.headKeyFields.forEach((val, key) => {
                    this._headKeyFieldList.push(val);
                });
            }
            return this._headKeyFieldList;
        }
        ParseCsv(csv) {
            let config = new LangConfig();
            config.id = csvGetInt(csv, this.GetHeadIndex("id"));
            let fieldList = this.headKeyFieldList;
            for (let i = 0; i < fieldList.length; i++) {
                let txt = csvGetString(csv, this.GetHeadIndex(fieldList[i]));
                let headType = this.GetHeadType(i);
                switch (headType) {
                    case ConfigFieldType.MStringArray:
                        config.dict.set(fieldList[i], toStringArray(txt));
                        break;
                    default:
                        config.dict.set(fieldList[i], txt);
                        break;
                }
            }
            this.addConfig(config);
        }
    }

    class LangConfigLoaderList {
        constructor() {
            this.lang = "zh_cn";
            this.renders = [];
            this.textCode = new LangConfigReader("TextCode");
            this.textFgui = new LangConfigReader("TextFgui");
        }
        initList() {
        }
    }

    class TEXT {
    }
    TEXT.NET_ERROR = "网络连接失败！请检查网络设备!加油哦！！";
    TEXT.Login = "登录";
    TEXT.Auth = "授权";
    TEXT.LangSelectMsg = "语言需要重启游戏才有效!";
    TEXT.FunNoOpen = "此功能暂未开放，敬请期待！";
    TEXT.ButtonSelect = "选择";
    TEXT.ButtonOk = "确定";
    TEXT.ButtonCannel = "取消";
    TEXT.ButtonYes = "是";
    TEXT.ButtonNo = "否";
    TEXT.Disable = "内容优化";
    TEXT.Lock = "无解锁配置！";
    TEXT.LvUpMax = "等级达到最大";
    TEXT.LvUpTo = "玩家升级 {0} → {1}";
    TEXT.Lv = "{0}级";
    TEXT.LVDot = "等级：{0}";
    TEXT.PlayerExp = "主公经验：{0}";
    TEXT.FatigueNotEnough = "体力不足，无法进行挑战";
    TEXT.cannotRecharge = "游客不能充值";
    TEXT.cannotRechargeNoIos = "只支持ios内购";
    TEXT.rechargeError = "充值失败，请稍候重试";
    TEXT.systemTip = "系统提示";
    TEXT.TitleTip = "提示";
    TEXT.ErorNoInitProto = "没有初始化网络";
    TEXT.ErorRequestServerList = "请求服务器列表失败";
    TEXT.ErorAccountFrozen = "账号被冻结";
    TEXT.ErorAccountDropped = "账号被停用";
    TEXT.TipEnterRoleName = "输入你的名称";
    TEXT.ErrorNameEmpty = "名字不能是空的";
    TEXT.ErrorContentEmpty = "内容不能是空的";
    TEXT.ErrorNameUsed = "名称已经被使用";
    TEXT.ErrorFormatName = "存在非法字符串，请修改后重试";
    TEXT.ErrorHttpSendFail = "[Error] 发送请求失败";
    TEXT.HttpTimeOut = "网络超时! 当前设置的超时时间是{0}";
    TEXT.AlertTextBuyActor = "是否花费{0}{1}增加艺人数量";
    TEXT.AlertTextScountActor = "是否花费{0}{1} 探查艺人？";
    TEXT.ToastTextItemNotEnough = "{0}数量不足";
    TEXT.ToastTextItemNotEnough2 = "数量不足，需要{0} {1}";
    TEXT.ChangeNameCost = "本次改名需要 {0}";
    TEXT.DuelTempLevel = "当前决斗神殿段位：{0}";
    TEXT.DuelTempMaxLevel = "历史最高决斗神殿段位：{0}";
    TEXT.DuelTempCurrentPvpLevel = "当前竞技排名：{0}";
    TEXT.DuelTempMaxPvpLevel = "历史最高竞技排名：{0}";
    TEXT.BattlePlanTeamHeroNameAndLevel = "{0}  {1}级";
    TEXT.BagCapacity = "{0}/{1}";
    TEXT.BagItemCount = "拥有：{0}";
    TEXT.BagExpiredLimitTip = "{0}后过期";
    TEXT.BagExpiredPeriodTip = "将在{0}过期";
    TEXT.BagItemSell = "出售";
    TEXT.BagItemUse = "使用";
    TEXT.BagItemSplit = "分解";
    TEXT.BagItemForge = "锻造";
    TEXT.BagItemChangeEquip = "穿戴";
    TEXT.BagItemLevelUp = "使用可增加{0}英雄经验";
    TEXT.EquipPropDes = "{0}+{1}";
    TEXT.EquipExclusiveTxtMsg = "{0}专属！只有{1}才可穿戴次装备";
    TEXT.EquipExclusiveTxt = "{0}专属";
    TEXT.EquipEatExp = "该装备可提供{0}的强化经验";
    TEXT.EquipTypeWeapon = "武器";
    TEXT.EquipTypeHelmet = "头盔";
    TEXT.EquipTypeArmor = "战甲";
    TEXT.EquipTypeBoots = "战靴";
    TEXT.EquipTypePendant = "玉佩";
    TEXT.EquipTypeGem = "宝物";
    TEXT.EquipNotEnough = "道具不足，无法选择";
    TEXT.EquipLevelUpStr1 = "下一级属性";
    TEXT.EquipLevelUpStr2 = "强化到{0}级时属性增加";
    TEXT.EquipAtkRange = "系数";
    TEXT.MailTitle = "邮件";
    TEXT.DeleteRead = "删除已读";
    TEXT.ToReader = "致玩家：";
    TEXT.ReawrdMsg = "奖励内容：";
    TEXT.Progress = "{0}/{1}";
    TEXT.N0 = "零";
    TEXT.N1 = "一";
    TEXT.N2 = "二";
    TEXT.N3 = "三";
    TEXT.N4 = "四";
    TEXT.N5 = "五";
    TEXT.N6 = "六";
    TEXT.N7 = "七";
    TEXT.N8 = "八";
    TEXT.N9 = "九";
    TEXT.N10 = "十";
    TEXT.N100 = "百";
    TEXT.N1000 = "千";
    TEXT.N10000 = "万";
    TEXT.RewardItemCount = "x{0}";
    TEXT.DATE_MonthBefore = "{0}个月前";
    TEXT.DATE_WeekBefore = "{0}周前";
    TEXT.DATE_DayBefore = "{0}天前";
    TEXT.DATE_HourBefore = "{0}小时前";
    TEXT.DATE_MinuteBefore = "{0}分钟前";
    TEXT.DATE_SecondeBefore = "{0}秒前";
    TEXT.Hour = "小时";
    TEXT.Minute = "分";
    TEXT.Second = "秒";
    TEXT.MissionNotOpen = "该关卡尚未开启";
    TEXT.Chapter = "第{0}章";
    TEXT.ChapterStarTipTitle = "本章累计{0}星可领取";
    TEXT.ChapterStarNotEnough = "星星数量不足";
    TEXT.ChapterRewardAlreadyGet = "奖励已经领取过";
    TEXT.ChapterSpecialTimes = "今日精英剩余次数：{0}";
    TEXT.ChapterMonsterTimes = "今日剩余次数：{0}";
    TEXT.SecretBookTimes = "今日剩余次数：{0}";
    TEXT.SecretBookTimesNotEnough = "该副本今日挑战次数不足";
    TEXT.SectionSpecialTotalTimes = "每日一共可购买{0}次精英奖励次数";
    TEXT.SectionMonsterTotalTimes = "每日一共可购买{0}次魔王奖励次数";
    TEXT.SecretBookTotalTimes = "每日一共可购买{0}次秘闻奖励次数";
    TEXT.SectionBuyTimesToast = "奖励次数提升";
    TEXT.SectionCurrentTimes = "今日第{0}次购买";
    TEXT.SectionTimesNotEnough = "今日次数已用完";
    TEXT.MissionUnlockCondition = "{0}级开启";
    TEXT.ChapterCurrentStarNum = "{0}/{1}";
    TEXT.SecretTimesRemain = "今日剩余次数: {0}";
    TEXT.MissionMaxTime = "通关时间低于{0}秒";
    TEXT.MissionKillBoss = "打败首领";
    TEXT.MissionHPState = "剩余生命超过{0}%";
    TEXT.MissionStamina = "x{0}";
    TEXT.SecretMissionTimesRemain = "今日剩余次数：{0}";
    TEXT.SecretLand_BestScore = "最佳成绩：大秘境{0}";
    TEXT.SecretLand_CurrentKeyStone = "当前钥石：{0}级";
    TEXT.SecretLand_Buy_Roll_Tips = "是否消耗{0}点体力兑换Roll币";
    TEXT.SecretLand_Roll_tips = "当日可兑换次数为{0}，Roll积攒数量上限为{1}";
    TEXT.SecretLand_Fatigue_Not_Enough = "您没有足够的体力值，需要{0}体力兑换Roll币";
    TEXT.Keystone_LevelUp_Time_Limit = "{0}分钟";
    TEXT.SecretLand_Level_Limit = "等级达到{0}后开启{1}层大秘境";
    TEXT.SecretLand_Time_Cost = "通关时间: {0}";
    TEXT.SecretLand_New_Keystone = "获取新钥匙：{0}{1}级";
    TEXT.Gashapon_NextFreeTime = "{0}后免费";
    TEXT.Gashapon_Rate = "概率 {0}%";
    TEXT.Gashapon_PropDisplay = "{0} +{1}";
    TEXT.Gashapon_Times_Remain = "每日可招募{0}次，今日剩余{1}次";
    TEXT.Gashapon_Times_Not_Enough = "今日剩余次数不足";
    TEXT.DuelSeasonDuration = "{0} - {1}";
    TEXT.DuelSeasonRemainDays = "距离赛季结束还有{0}";
    TEXT.DuelCurrentWinTimes = "本赛季胜场：{0}";
    TEXT.DuelSelectHeroGroupFirst = "请先选择队伍";
    TEXT.DuelTempOldSeason = "恭喜您，在上赛季结算时的段位达到了{0}，赛季奖励已经发送 到您的邮箱";
    TEXT.DuelTempNewSeason = "由于您上赛季的出色表现，您在本赛季的起始段位为{0}";
    TEXT.DuelTempWinTimes = "胜场：{0}";
    TEXT.HeroSkillOpenLevel = "英雄等级达到{0}级别后解锁";
    TEXT.HeroMaxLevel = "已满级";
    TEXT.HeroInBattle = "当前英雄已在队伍中！！！";
    TEXT.HeroStarProStr = "成长";
    TEXT.HeroLevelUpNotEnough = "当前无法升级，请提升战队等级";
    TEXT.HeroLevelUpItemNotEnough = "物品不足，无法升级";
    TEXT.HeroLevelUpMax = "已提升当前最高级";
    TEXT.RankMyAllRank = "我的全区排行：{0}";
    TEXT.RankNotOnRank = "未上榜";
    TEXT.RankDanStar = "{0} {1}星";
    TEXT.HeroSkillLevelNotLevel = "升级条件不足，需英雄{0}级";
    TEXT.SecretBookHeroLevelNotEnough = "英雄{0}级开启";
    TEXT.GuideFinish = "现在引导结束了，你可以自由体验了";
    TEXT.GuideGoToBattle = "guide_go_section";
    TEXT.GuideBackHome = "guide_go_back_home";
    TEXT.GuideBack = "guide_go_back";

    class LangConfigLoader extends LangConfigLoaderList {
        constructor() {
            super(...arguments);
            this.sLoadProgress = new Typed3Signal();
            this.sLoaded = new Signal();
            this.loadProgress = 0;
            this.isLoadCompleted = false;
            this.textRenders = [];
            this.sTextLoaded = new Signal();
        }
        async loadAllAsync() {
            return new Promise((resolve) => {
                this.loadAll();
                this.sLoaded.addOnce(() => {
                    resolve();
                }, this);
            });
        }
        loadAll() {
            this.loadProgress = 0;
            let count = this.renders.length;
            let loadedNum = 0;
            let onItemLoaded = () => {
                loadedNum++;
                this.loadProgress = loadedNum / count;
                this.sLoadProgress.dispatch(loadedNum, count, this.loadProgress);
                if (loadedNum >= count) {
                    this.onGameLoadedAll();
                }
            };
            for (let i = 0; i < this.renders.length; i++) {
                this.renders[i].lang = this.lang;
                this.renders[i].load(this.configLoader, onItemLoaded);
            }
        }
        onGameLoadedAll() {
            for (let i = 0; i < this.renders.length; i++) {
                this.renders[i].onGameLoadedAll();
            }
            this.setCodeTEXT();
            ConfigApi.setFguiStringSource(this.textFgui);
            this.isLoadCompleted = true;
            this.sLoaded.dispatch();
        }
        loadText() {
            let renders = this.textRenders;
            if (renders.length == 0) {
                renders.push(this.textCode);
                renders.push(this.textFgui);
            }
            this.loadProgress = 0;
            let count = renders.length;
            let loadedNum = 0;
            let onItemLoaded = () => {
                loadedNum++;
                if (loadedNum >= count) {
                    this.onLoadTextComplte();
                }
            };
            for (let i = 0; i < renders.length; i++) {
                renders[i].lang = this.lang;
                renders[i].load(this.configLoader, onItemLoaded);
            }
        }
        onLoadTextComplte() {
            let renders = this.textRenders;
            for (let i = 0; i < renders.length; i++) {
                renders[i].onGameLoadedAll();
            }
            this.setCodeTEXT();
            ConfigApi.setFguiStringSource(this.textFgui);
            this.sTextLoaded.dispatch();
        }
        setCodeTEXT() {
            if (!this._srcTEXT && TEXT) {
                this._srcTEXT = new Dictionary();
                for (let key in TEXT) {
                    this._srcTEXT.add(key, TEXT[key]);
                }
            }
            let list = this.textCode.getConfigList();
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                let key = item.dict.getValue("key");
                let value = item.dict.getValue("value");
                if (!isNullOrEmpty(value)) {
                    TEXT[key] = value;
                }
            }
        }
    }

    class LangManager {
        constructor() {
            this.isUseLang = false;
            this._lang = null;
            this.langListDict = new Dictionary();
        }
        static get Instance() {
            if (!LangManager._Instance) {
                LangManager._Instance = new LangManager();
            }
            return LangManager._Instance;
        }
        get httpLang() {
            if (!this._httpLang) {
                this.httpLang = this.lang;
            }
            return this._httpLang;
        }
        set httpLang(value) {
            value = value.replace("_", "-");
            if (value.indexOf("-")) {
                let arr = value.split("-");
                for (let i = 1; i < arr.length; i++) {
                    arr[i] = arr[i].toUpperCase();
                }
                value = arr.join("-");
            }
            this._httpLang = value;
        }
        get lang() {
            if (!this._lang) {
                this._lang = LangType.zh_cn;
                this.httpLang = this._lang;
            }
            return this._lang;
        }
        set lang(value) {
            this._lang = value;
            this.httpLang = value;
        }
        get current() {
            if (this._current) {
                return this._current;
            }
            if (!this.langListDict.hasKey(this.lang)) {
                let langList = new LangConfigLoader();
                langList.lang = this.lang;
                this.langListDict.add(langList.lang, langList);
                this._current = langList;
            }
            return this.langListDict.getValue(this.lang);
        }
        getValue(tableName, id, fieldName) {
            let langReader = this.current[tableName];
            if (langReader) {
                let config = langReader.getConfig(id);
                if (config) {
                    return config.dict.get(fieldName);
                }
            }
            return null;
        }
    }
    window['LangManager'] = LangManager;

    class LoaderConfigLang extends excelconfigSources.Loader {
    }
    class MenuConfigLang extends excelconfigSources.Menu {
        get name() {
            if (!LangManager.Instance.isUseLang)
                return this.zhCnName;
            let value = LangManager.Instance.getValue('Menu', this.id, 'zhCnName');
            if (!isNullOrEmpty(value)) {
                return value;
            }
            return this.zhCnName;
        }
    }
    class MsgConfigLang extends excelconfigSources.Msg {
        get notice() {
            if (!LangManager.Instance.isUseLang)
                return this.zhCnNotice;
            let value = LangManager.Instance.getValue('Msg', this.id, 'zhCnNotice');
            if (!isNullOrEmpty(value)) {
                return value;
            }
            return this.zhCnNotice;
        }
    }
    class UnlockConfigLang extends excelconfigSources.Unlock {
        get name() {
            if (!LangManager.Instance.isUseLang)
                return this.zhCnName;
            let value = LangManager.Instance.getValue('Unlock', this.id, 'zhCnName');
            if (!isNullOrEmpty(value)) {
                return value;
            }
            return this.zhCnName;
        }
    }

    class LoaderConfig extends LoaderConfigLang {
    }

    class MenuConfig extends MenuConfigLang {
    }

    class MsgConfig extends MsgConfigLang {
    }

    class UnlockConfig extends UnlockConfigLang {
    }

    class ExcelConfigReader {
        constructor(tabelName, tabelConfigClass) {
            this._configList = [];
            this.tableName = tabelName;
            this.tabelConfigClass = tabelConfigClass;
        }
        onGameLoadedAll() {
        }
        get configDict() {
            if (!this._configDict) {
                this._configDict = ExcelConfigManager.pbconfig[this.tableName];
            }
            return this._configDict;
        }
        get configList() {
            if (this._configList.length == 0) {
                for (let id in this.configDict) {
                    this._configList.push(this.configDict[id]);
                }
            }
            return this._configList;
        }
        getConfigList() {
            return this.configList;
        }
        getConfig(id) {
            if (!this.configDict[id]) {
                console.log(`${this.tableName} 没有 id=${id} 的配置`);
            }
            return this.configDict[id];
        }
        hasConfig(id) {
            return this.configDict[id] ? true : false;
        }
        shieldConfig(ids) {
            for (let i = 0, len = ids.length; i < len; i++) {
                let id = ids[i];
                if (this.hasConfig(id)) {
                    delete this._configDict[id];
                    let configlist = this.configList;
                    for (let i = 0, len = configlist.length; i < len; i++)
                        if (configlist[i].id == id) {
                            configlist.splice(i, 1);
                            break;
                        }
                }
            }
        }
    }

    class LoaderConfigReader extends ExcelConfigReader {
    }

    class MenuConfigReader extends ExcelConfigReader {
    }

    class MsgConfigReader extends ExcelConfigReader {
    }

    class UnlockConfigReader extends ExcelConfigReader {
    }

    class ExcelConfigManager {
        constructor() {
            this.loader = new LoaderConfigReader('Loader', LoaderConfig);
            this.menu = new MenuConfigReader('Menu', MenuConfig);
            this.msg = new MsgConfigReader('Msg', MsgConfig);
            this.unlock = new UnlockConfigReader('Unlock', UnlockConfig);
        }
        static Init() {
            excelconfig.Loader = LoaderConfig;
            excelconfig.Menu = MenuConfig;
            excelconfig.Msg = MsgConfig;
            excelconfig.Unlock = UnlockConfig;
        }
    }

    class ConfigManagerExpressionList extends ExcelConfigManager {
    }

    var EnumExcelConfigType;
    (function (EnumExcelConfigType) {
        EnumExcelConfigType[EnumExcelConfigType["pb"] = 0] = "pb";
        EnumExcelConfigType[EnumExcelConfigType["json"] = 1] = "json";
    })(EnumExcelConfigType || (EnumExcelConfigType = {}));
    class ConfigManager extends ConfigManagerExpressionList {
        constructor() {
            super();
            this.sLoadProgress = new Typed3Signal();
            this.sLoaded = new Signal();
            this.loadProgress = 0;
            this.readers = [];
            this.readerMap = new Map();
            this.configType = EnumExcelConfigType.json;
            this.initList();
        }
        static get Instance() {
            if (!ConfigManager._Instance) {
                ConfigManager._Instance = new ConfigManager();
            }
            return ConfigManager._Instance;
        }
        initList() {
            ExcelConfigManager.Init();
            this.readers.length = 0;
            for (let key in this) {
                let item = this[key];
                if (item instanceof ExcelConfigReader) {
                    this.readers.push(item);
                    this.readerMap.set(item.tableName, item);
                }
            }
        }
        async loadAllAsync() {
            this.loadProgress = 0;
            let count = this.readers.length;
            let loadedNum = 0;
            switch (this.configType) {
                case EnumExcelConfigType.pb:
                    await this.loadPB();
                    break;
                default:
                    await this.loadJson();
                    break;
            }
            window['Global'] = ExcelConfigManager.pbconfig.Global;
            this.onGameLoadedAll();
        }
        async loadPB() {
            let arrayBuffer = await ConfigApi.loadResAsyncFun("res/config/pb/excelconfig.bin", Laya.Loader.BUFFER);
            let buffer = new Uint8Array(arrayBuffer);
            ExcelConfigManager.pbconfig = excelconfig.ConfigMng.decode(buffer);
        }
        async loadJson() {
            let json = await ConfigApi.loadResAsyncFun("res/config/pb/excelconfig.json", Laya.Loader.JSON);
            this.InstallJson(json);
        }
        InstallJson(json) {
            let cm = ExcelConfigManager.pbconfig = new excelconfig.ConfigMng();
            let globalJson = json['Global'];
            let globalConfig = new excelconfig.Global();
            for (var key in globalJson) {
                let configKey = this.keyToPbKey(key);
                globalConfig[key] = globalJson[key];
            }
            cm.Global = globalConfig;
            for (let tabelName in json) {
                let tabelJson = json[tabelName];
                if (!this.readerMap.has(tabelName))
                    continue;
                let reader = this.readerMap.get(tabelName);
                let configCls = reader.tabelConfigClass;
                cm[tabelName] = {};
                for (let id in tabelJson) {
                    let lineJson = tabelJson[id];
                    let config = new configCls();
                    for (var key in lineJson) {
                        let configKey = this.keyToPbKey(key);
                        config[configKey] = lineJson[key];
                    }
                    cm[tabelName][id] = config;
                }
            }
        }
        keyToPbKey(key) {
            if (key.indexOf("_") == -1)
                return key;
            let arr = key.split('_');
            for (let i = 1; i < arr.length; i++) {
                let str = arr[i];
                if (str.length >= 1) {
                    arr[i] = str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1);
                }
            }
            key = arr.join('');
            return key;
        }
        onGameLoadedAll() {
            for (let i = 0; i < this.readers.length; i++) {
                this.readers[i].onGameLoadedAll();
            }
            this.sLoaded.dispatch();
        }
    }
    window['ConfigManager'] = ConfigManager;

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
            console.log("aaa");
            this.initConfig();
        }
        async initConfig() {
            var configManager = ConfigManager.Instance;
            await configManager.loadAllAsync();
            window['configManager'] = configManager;
            console.log(configManager);
        }
        onLoadConfigProgress() {
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
//# sourceMappingURL=bundle.js.map

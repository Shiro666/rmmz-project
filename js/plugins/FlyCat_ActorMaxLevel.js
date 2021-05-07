//=============================================================================
// RPG Maker MZ - 属性破限、角色等级限制、角色等级名称自定义
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 属性破限、角色等级限制、角色等级名称自定义
 * @author 飞猫工作室（Fly_Cat/Fly_Roc）
 *
 * @param 等级上限
 * @text 默认等级上限
 * @type number
 * @desc 默认等级上限（默认上限：99级）
 * @default 99
 * 
 * @param 人物HP上限
 * @text 人物HP上限
 * @type number
 * @desc 默认HP上限（默认上限：9999）
 * @default 9999
 *
 * @param 人物MP上限
 * @text 人物MP上限
 * @type number
 * @desc 默认MP上限（默认上限：9999）
 * @default 9999
 *  
 * @param 人物其他属性上限
 * @text 人物其他属性上限
 * @type number
 * @desc 默认其他属性上限（默认上限：9999）
 * @default 9999
 * 
 * @param 敌人HP上限
 * @text 敌人HP上限
 * @type number
 * @desc 默认HP上限（默认上限：999999）
 * @default 999999
 *
 * @param 敌人MP上限
 * @text 敌人MP上限
 * @type number
 * @desc 默认MP上限（默认上限：9999）
 * @default 9999
 *
 * @param 敌人其他属性上限
 * @text 敌人其他属性上限
 * @type number
 * @desc 默认其他属性上限（默认上限：9999）
 * @default 9999
 * 
 * @command ChangeActorMaxLevel
 * @text 修改指定角色等级上限
 * @desc 修改指定角色等级上限
 *
 * @arg ActorId
 * @type number
 * @min 1
 * @max 9999
 * @default 1
 * @text 角色ID号
 * @desc 角色ID号设置
 *
 * @arg ActorMaxLevel
 * @type number
 * @min 1
 * @max 9999
 * @default 1
 * @text 等级上限
 * @desc 等级上限（最小为1）
 *
 * @command OpenLevelShow
 * @text 等级境界显示开关（默认：开启）
 * @desc 关闭：true 打开：false
 *
 * @arg button
 * @type boolean
 * @default true
 * @text 开关状态
 * @desc 开关状态
 * 
 * @help
 * 1.改变角色等级显示为修仙境界
 * 2.修改角色等级上限 插件命令：ChangeActorMaxLevel （可指定角色等级）
 * 3.开启关闭境界显示 插件命令：OpenLevelShow （开启:fasle 关闭:true）
 * 4.属性破限：自定义敌人和玩家属性上限
 * 5.等级境界为修仙境界，需要自行在JS内修改
 * 6.承接MV、MZ定制插件  QQ：903516931
 */
var Imported = Imported || {};
Imported.ActorMaxLevel = true;

var FlyCat = FlyCat || {};
FlyCat.ActorMaxLevel = {};
FlyCat.ActorMaxLevel.parameters = PluginManager.parameters('FlyCat_ActorMaxLevel');
FlyCat.ActorMaxLevel.MaxLevel = Number(FlyCat.ActorMaxLevel.parameters['等级上限'] || 99);
FlyCat.ActorMaxLevel.MaxActorHp = Number(FlyCat.ActorMaxLevel.parameters['人物HP上限'] || 9999);
FlyCat.ActorMaxLevel.MaxActorMp = Number(FlyCat.ActorMaxLevel.parameters['人物MP上限'] || 9999);
FlyCat.ActorMaxLevel.MaxActorParam = Number(FlyCat.ActorMaxLevel.parameters['人物其他属性上限'] || 9999);
FlyCat.ActorMaxLevel.MaxEnemyHp = Number(FlyCat.ActorMaxLevel.parameters['敌人HP上限'] || 999999);
FlyCat.ActorMaxLevel.MaxEnemyMp = Number(FlyCat.ActorMaxLevel.parameters['敌人MP上限'] || 9999);
FlyCat.ActorMaxLevel.MaxEnemyParam = Number(FlyCat.ActorMaxLevel.parameters['敌人其他属性上限'] || 9999);
PluginManager.registerCommand('FlyCat_ActorMaxLevel', 'ChangeActorMaxLevel', args => {
    $gameSystem.ChangeActorMaxLevel(args.ActorId, args.ActorMaxLevel);
});
PluginManager.registerCommand('FlyCat_ActorMaxLevel', 'OpenLevelShow', args => {
    $gameSystem.OpenLevelShow(eval(args.button));
});
Game_System.prototype.ChangeActorMaxLevel = function (ActorId, ActorMaxLevel) {
    $gameActors.actor(ActorId)._ActorMaxLevel = ActorMaxLevel;
};
Game_System.prototype.OpenLevelShow = function (button) {
    this._OpenLevelShow = button;
};
//////////////////////////////等级破限////////////////////////////////

Game_Actor.prototype.maxLevel = function () {

    if (this._ActorMaxLevel) {
        return this._ActorMaxLevel;
    }
    else {
        return FlyCat.ActorMaxLevel.MaxLevel;
    }
};
FlyCat.ActorMaxLevel.paramBase = Game_Actor.prototype.paramBase;
Game_Actor.prototype.paramBase = function (paramId) {
    if (this.level > 99) {
        var UpLevel = this.currentClass().params[paramId][99];
        var DownLevel = this.currentClass().params[paramId][98];
        UpLevel += (UpLevel - DownLevel) * (this.level - 98);
        return UpLevel;
    }
    return FlyCat.ActorMaxLevel.paramBase.call(this, paramId);
};
//////////////////////////////属性破限////////////////////////////////
Game_Actor.prototype.paramMax = function (paramId) {
    if (paramId === 0) {
        return FlyCat.ActorMaxLevel.MaxActorHp;// MHP
    } else if (paramId === 1) {
        return FlyCat.ActorMaxLevel.MaxActorMp;// MMP
    } else {
        return FlyCat.ActorMaxLevel.MaxActorParam;// Param
    }
    return Game_Battler.prototype.paramMax.call(this, paramId);
};


Game_BattlerBase.prototype.paramMax = function (paramId) {
    if (paramId === 0) {
        return FlyCat.ActorMaxLevel.MaxEnemyHp;// MHP
    } else if (paramId === 1) {
        return FlyCat.ActorMaxLevel.MaxEnemyMp; // MMP
    } else {
        return FlyCat.ActorMaxLevel.MaxEnemyParam;// Param
    }

};
//////////////////////////////等级改名////////////////////////////////
Window_StatusBase.prototype.drawActorLevel = function (actor, x, y) {
    if (!$gameSystem._OpenLevelShow) {
        this.drawText(this.LevelName(actor.level), x, y, 312);
        console.log(actor.level);
    }
    else {
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(TextManager.levelA, x, y, 48);
        this.resetTextColor();
        this.drawText(actor.level, x + 84, y, 36, "right");
        console.log(actor.level);
    }
};

Window_StatusBase.prototype.LevelName = function (level) {
    switch (true) {
        case [1].contains(level):
            return "凡人";
            break;
        case [2].contains(level):
            return "先天初期";
            break;
        case [3].contains(level):
            return "先天中期";
            break;
        case [4].contains(level):
            return "先天后期";
            break;
        case [5].contains(level):
            return "先天圆满";
            break;
        case [6, 7, 8].contains(level):
            return "炼气初期";
            break;
        case [9, 10, 11].contains(level):
            return "炼气中期";
            break;
        case [12, 13, 14].contains(level):
            return "炼气后期";
            break;
        case [15, 16, 17].contains(level):
            return "炼气圆满";
            break;
        case [18, 19, 20, 21, 22].contains(level):
            return "筑基初期";
            break;
        case [23, 24, 25, 26, 27].contains(level):
            return "筑基中期";
            break;
        case [28, 29, 30, 31, 32].contains(level):
            return "筑基后期";
            break;
        case [33, 34, 35, 36, 37].contains(level):
            return "筑基圆满";
            break;
        case [38, 39, 40, 41, 42, 43, 44, 45, 46, 47].contains(level):
            return "金丹初期";
            break;
        case [48, 49, 50, 51, 52, 53, 54, 55, 56, 57].contains(level):
            return "金丹中期";
            break;
        case [58, 59, 60, 61, 62, 63, 64, 65, 66, 67].contains(level):
            return "金丹后期";
            break;
        case [68, 69, 70, 71, 72, 73, 74, 75, 76, 77].contains(level):
            return "金丹圆满";
            break;
        case level >= 78 && level < 98:
            return "元婴初期";
            break;
        case level >= 98 && level < 118:
            return "元婴中期";
            break;
        case level >= 118 && level < 138:
            return "元婴后期";
            break;
        case level >= 138 && level < 158:
            return "元婴圆满";
            break;
        case level >= 158 && level < 208:
            return "化神初期";
            break;
        case level >= 208 && level < 258:
            return "化神中期";
            break;
        case level >= 258 && level < 308:
            return "化神后期";
            break;
        case level >= 308 && level < 358:
            return "化神圆满";
            break;
        default:
            return "婴变期";
            break;
    }
}
import BaseConfig from "./BaseConfig";

import ConfigRenderInterface from "./Interfaces/ConfigRenderInterface";
import ConfigLoaderInterface from "./Interfaces/ConfigLoaderInterface";
import ConfigRenderComplete from "./Interfaces/ConfigRenderComplete";
import ConfigApi from "./ConfigApi";

export default abstract class BaseConfigRender<T extends BaseConfig> implements ConfigRenderInterface
{
    // 表名
    tableName: string;

    // 配置字典
    configs: Map<number, T> = new Map<number, T>();

    // 获取配置列表
    getConfigList()
    {
        var list = [];
        this.configs.forEach((config, key)=>{
            list.push(config);
        })
    
        return list;
    }

    // 配置列表
    get configList()
    {
        return this.getConfigList();
    }

    // 获取配置
    getConfig(id: number)
    {
        if (!this.configs.has(id))
        {
            console.log(`${this.tableName} 没有 id=${id} 的配置`);
        }
        return this.configs.get(id);
    }

    // 添加配置
    addConfig(config: T)
    {
        this.configs.set(config.id, config);
    }



    // 获取配置文件路径        
    getConfigPath(): string
    {
        return ConfigApi.configRootPath + `csv/${this.tableName}.csv`;
    }

    // 加载配置
    load(configLoader?: ConfigLoaderInterface, onComplete?: ConfigRenderComplete)
    {

    }

    // 重新加载配置
    reload(configLoader?: ConfigLoaderInterface, onComplete?: ConfigRenderComplete)
    {

    }


    // 游戏加载完所有
    onGameLoadedAll()
    {

    }

    // 清理
    clear()
    {
        this.configs.clear();
    }


}
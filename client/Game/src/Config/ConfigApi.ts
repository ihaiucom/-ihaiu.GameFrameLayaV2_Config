import LangConfigReader from "./LangConfigReader";

/** 配置对外扩展接口 */
export default class ConfigApi
{
    //===================
    // 对外
    //-------------------

    /** 设置FairyGUI 多语言 */
    static callFguiSetStringsSource: (lang: LangConfigReader)=>void;

    /** 加载配置 */
    static callLoadResAsync: (path: string, type: string)=>Promise<any>;

    /** 配置根目录路径 */
    static callConfigRootPath: ()=>string;


    //===================
    // 内部
    //-------------------
    
    /** 设置FairyGUI 多语言 */
    static setFguiStringSource(lang: LangConfigReader)
    {
        if(this.callFguiSetStringsSource)
        {
            this.callFguiSetStringsSource(lang);
        }
    }




    /** 获取异步加载函数 */
    static get loadResAsyncFun(): (path: string, type: string)=>Promise<any>
    {
        if(this.callLoadResAsync)
        {
            return this.callLoadResAsync;
        }
        else
        {
            return this.loadResAsync;
        }
    }

    
    // 加载资源, 异步
    private static async loadResAsync(path: string, type: string): Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    Laya.timer.frameOnce(1, null, ()=>{
                        resolve(res);
                    })
                }), 
                null, type);
         });
    }

    /** 配置根目录路径 */
    static get configRootPath()
    {
        if(this.callConfigRootPath)
        {
            return this.callConfigRootPath();
        }
        
        return "res/config/";
    }

    
}
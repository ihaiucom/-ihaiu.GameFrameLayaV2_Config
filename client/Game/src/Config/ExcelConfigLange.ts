import LangManager from './LangManager';


export class LoaderConfigLang extends excelconfigSources.Loader
{

}

export class MenuConfigLang extends excelconfigSources.Menu
{

	get name():string
	{
		if(!LangManager.Instance.isUseLang)
			return this.zhCnName

		let value = <string> LangManager.Instance.getValue('Menu', this.id, 'zhCnName');
		if (!isNullOrEmpty(value))
		{
			return value;
		}
		return this.zhCnName
	}

}

export class MsgConfigLang extends excelconfigSources.Msg
{

	get notice():string
	{
		if(!LangManager.Instance.isUseLang)
			return this.zhCnNotice

		let value = <string> LangManager.Instance.getValue('Msg', this.id, 'zhCnNotice');
		if (!isNullOrEmpty(value))
		{
			return value;
		}
		return this.zhCnNotice
	}

}

export class UnlockConfigLang extends excelconfigSources.Unlock
{

	get name():string
	{
		if(!LangManager.Instance.isUseLang)
			return this.zhCnName

		let value = <string> LangManager.Instance.getValue('Unlock', this.id, 'zhCnName');
		if (!isNullOrEmpty(value))
		{
			return value;
		}
		return this.zhCnName
	}

}
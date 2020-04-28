(
	rem enable over
    zffile copy ../ExcelJson/clientConfig.json ../../../client/Game/bin/res/config/pb/excelconfig.json -o true
    zffile copy ../Script/ExcelConfigTS/excelconfig.js ../../../client/Game/bin/libs/pbconfig/excelconfig.js -o true
    zffile copy ../Script/ExcelConfigTS/excelconfig.d.ts ../../../client/Game/libs/excelconfig.d.ts -o true
    zffile copy ../Script/ExcelConfigTS/excelconfig-sources.d.ts ../../../client/Game/libs/excelconfig-sources.d.ts -o true
    zffile copy ../Script/ExcelConfigTS/ExcelConfigLange.ts ../../../client/Game/src/Config/ExcelConfigLange.ts -o true
    zffile copy ../Script/ExcelConfigTS/ExcelConfigManager.ts ../../../client/Game/src/Config/ExcelConfigManager.ts -o true


	rem disable over
    zffile copy ../Script/ExcelConfigTS/ExcelConfigReader.ts ../../../client/Game/src/Config/ExcelConfigReader.ts -o false
    zffile copy ../Script/ExcelConfigTS/ConfigExtends ../../../client/Game/src/Config/ConfigExtends -o false
    zffile copy ../Script/ExcelConfigTS/ReaderExtends ../../../client/Game/src/Config/ReaderExtends -o false
)
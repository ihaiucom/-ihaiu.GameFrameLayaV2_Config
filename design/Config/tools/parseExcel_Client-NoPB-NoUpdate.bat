(
    rem svn up ../
    python excel2json.py --dir=../
    REM python excel2go.py --dir=../
    python excel2ts.py --dir=../
    python excel2pb_nopb.py --dir=../ --noPB
    dotnet ./Copy/Copy.dll --setting=./CopyClientSetting.json
    pause
)
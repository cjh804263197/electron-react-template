# electron-react-template
The template for electron react


### 注意
打包 windows 安装包时，需要将 `node_modules/sharp` 移除掉，并使用命令
```shell
npm install --platform=win32 --arch=x64 sharp
```
否则会造成打包应用打开之后报错，the specified module could not be found 
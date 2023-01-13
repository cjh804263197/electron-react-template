import * as sizeOf from 'image-size';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

interface IBaseImg {
    name: string;
    path: string;
}

type IResize = Pick<sharp.ResizeOptions, "width" | "height">

type IJpeg = Pick<sharp.JpegOptions, "quality">


/**
 * 检索指定路径下的图片
 * @param sourcePath 指定路径
 * @returns 图片路径
 */
export function searchImage(sourcePath: string): Promise<IBaseImg[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(sourcePath, (err, files) => {
            if (err) {
                reject(err)
            }

            const targetFilePaths = files
            .filter(fileName => fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.JPEG'))
            .map(fileName => ({
                name: fileName,
                path: path.resolve(sourcePath, fileName)
            }))
            resolve(targetFilePaths)
        })
    })
}

/**
 * 剪裁图片
 * @param imgPath 图片路径
 * @param imgName 图片名称
 * @param targetPath 输出路径
 * @param resize 指定尺寸
 * @returns 
 */
export function corpImage(imgPath: string, imgName: string, targetPath: string, jpeg: IJpeg, resize?: IResize) {
    return new Promise((resolve, reject) => {
        let { width, height } = sizeOf(imgPath);
        if(!fs.existsSync(targetPath)) fs.mkdirSync(targetPath);
        const img = sharp(imgPath);
        if (height > width) {
            img.rotate(90);
            // swip
            let temp = width;
            width = height;
            height = temp;
        }
        img
        .resize(resize?.width || 640, resize?.height || 360, { fit: 'cover' })
        .jpeg({ quality: Number(jpeg.quality) })
        .toFile(path.resolve(targetPath, imgName), (err, info) => {
            err ? reject(err) : resolve(info)
        })
    })
}
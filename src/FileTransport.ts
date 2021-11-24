import RNFS from 'react-native-fs';

class FileTransport {
    async saveToFile(savePath : string, contents, encoding = 'ascii') {
        try {
            await RNFS.writeFile(savePath, contents, encoding);
        } catch (err: any) {
            console.log(err.message, err.code);
        }
    }

    async readFile(filePath : string, encoding = 'ascii') {
        try {
            await RNFS.readFile(filePath, encoding);
        } catch (err: any) {
            console.log(err.message, err.code);
        }
    }

    async deleteFile() {
        try {
            await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/temp/`);
        } catch (err: any) {
            console.log(err.message, err.code);
        }
    }
}

export default new FileTransport();

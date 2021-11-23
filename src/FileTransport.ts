import RNFS from 'react-native-fs';
import { Logger } from './Logger';

const defaultRNFSConfig = {
    fileName: '', // file name where the logs will be written
    filePath: '' // path to file
};

class FileTransport extends Logger {
    constructor(props) {
        super(props);
    }

    async saveToFile( savePath : string, contents, encoding = 'ascii' ) {
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

const initializeFileTranport = (config = defaultRNFSConfig) => {
    return new FileTransport(config);
}

const fileTransport = { initializeFileTranport };

export { fileTransport };

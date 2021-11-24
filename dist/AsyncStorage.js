var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AsyncStorage from '@react-native-async-storage/async-storage';
export function saveToAsyncStorage(key, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dataJSON = JSON.stringify(data);
            yield AsyncStorage.setItem(key, dataJSON);
            console.log(`${key} was successfuly saved to async storage.`);
        }
        catch (err) {
            console.log(`${key} saving to async storage error: `, err);
        }
    });
}
export function getFromAsyncStorage(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const savedDataJSON = (yield AsyncStorage.getItem(key)) || 'null';
            console.log(`${key} was successfuly getted from async storage.`);
            return JSON.parse(savedDataJSON);
        }
        catch (err) {
            console.log(`${key} getting from async storage error: `, err);
        }
    });
}
export function clearAsyncStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield AsyncStorage.clear();
            console.log('Async storage was successfuly cleared.');
        }
        catch (err) {
            console.log('Clearing async storage error: ', err);
        }
    });
}
export function removeFromAsyncStorage(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield AsyncStorage.removeItem(key);
            console.log(`${key} was successfuly removed from async storage.`);
        }
        catch (err) {
            console.log(`${key} removing from async storage error: `, err);
        }
    });
}

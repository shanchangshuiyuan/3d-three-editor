/**
 * @description  indexedDB 方法封装
 * @function init  连接数据库
 * @function set   修改数据库
 * @function get   获取数据库
 */
import { isRef, isReactive, toRaw } from "vue";

let indexedDb = window.indexedDB;
let name = "threeEdit";
let version = 1;
let database = null;

function createIndexedDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(name, version);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("myStore")) {
        db.createObjectStore("myStore", { autoIncrement: true });
      }
    };
    request.onsuccess = event => {
      database = event.target.result;
      resolve();
    };
    request.onerror = event => {
      console.error("IndexedDB", event);
      reject(event);
    };
  });
}

createIndexedDb();

function convertToPlainData(reactiveData) {
  if (Array.isArray(reactiveData)) {
    return reactiveData.map(item => convertToPlainData(item));
  } else if (typeof reactiveData === "object" && reactiveData !== null) {
    const plainData = {};
    for (let key in reactiveData) {
      plainData[key] = convertToPlainData(reactiveData[key]);
    }
    return plainData;
  } else {
    return reactiveData;
  }
}

function putArray(data) {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const putData = convertToPlainData(data);

    const putRequest = objectStore.put(putData);
    putRequest.onsuccess = () => {
      resolve();
      console.log(
        "[" + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + "]",
        "Saved state to IndexedDB. " + (performance.now() - start).toFixed(2) + "ms"
      );
    };

    // 先获取历史记录
    // const getRequest = objectStore.get('MODEL_EDIT_RECORD');
    // getRequest.onsuccess = (e) => {

    // 	const result = e.target.result
    // 	// 如果偶历史记录则
    // 	if (result && Array.isArray(result.historyRecord)) {
    // 		putData.historyRecord = result.historyRecord.concat([putData.activeRecord])
    // 	} else {
    // 		putData.historyRecord = [putData.activeRecord]
    // 	}
    // 	delete putData.activeRecord
    // 	const putRequest = objectStore.put(putData);

    // 	putRequest.onsuccess = () => {
    // 		resolve()
    // 		console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'Saved state to IndexedDB. ' + (performance.now() - start).toFixed(2) + 'ms');
    // 	};

    // }
    // getRequest.onerror = (event) => {
    // 	console.error('IndexedDB', event);
    // 	reject(event)
    // }
  });
}
function getArray() {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const request = objectStore.openCursor();
    let results = [];
    request.onsuccess = e => {
      let cursor = e.target.result;
      if (cursor) {
        const putData = {
          key: cursor.key,
          ...cursor.value
        };
        results.push(putData);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = event => {
      reject(event);
    };
  });
}
function removeArray(key) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const request = objectStore.delete(key);
    request.onsuccess = e => {
      resolve();
    };
    request.onerror = event => {
      reject(event);
    };
  });
}
function clear() {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const request = objectStore.clear();
    request.onsuccess = e => {
      resolve(e.target.result);
    };
    request.onerror = event => {
      reject(event);
    };
  });
}
function get(id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const request = objectStore.get(id);
    request.onsuccess = e => {
      resolve(e.target.result);
    };
    request.onerror = event => {
      reject(event);
    };
  });
}
function remove(id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["myStore"], "readwrite");
    const objectStore = transaction.objectStore("myStore");
    const request = objectStore.delete(id);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = event => {
      reject(event);
    };
  });
}

export const indexedDB = {
  putArray,
  getArray,
  removeArray,
  clear,
  get,
  remove
};

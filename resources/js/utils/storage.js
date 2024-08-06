const pako = require("pako");
const localforage = require("localforage");

const saveStorage = (jsonData) => {
  let data = jsonData;
  console.log("check metafield data", data);
  try {
    data = new TextEncoder().encode(JSON.stringify(data));
    data = pako.deflate(data, { level: 6 });
    localforage.setItem("data", data);
  } catch (e) {
    throw e;
  }
};

async function getStorage(uniqueId) {
  let data = false;
  try {
    data = await localforage.getItem(`${uniqueId}`);
    if (data) {
      data = pako.inflate(data, { level: 6 });
      data = JSON.parse(new TextDecoder("utf-8").decode(data));
    }

    return data;
  } catch (e) {
    throw e;
  }
}

function zipFile(data) {
  return pako.deflate(data, { level: 6 });
}

function unzipFile(data) {
  return pako.inflate(data, { level: 6 });
}

module.exports = {
  getStorage,
  saveStorage,
};

const pako = require("pako");
const localforage = require("localforage");

const saveStorage = (jsonData) => {
  let data = jsonData;
  console.log("check metafield data", data);
  //   const nonNullMetafields = data
  //     .filter((p) => p.metafields.candysizesweight !== "null")
  //     .map((p) => p);
  //   console.log("nonNullMetafields", nonNullMetafields);
  const subtitle = data
    .filter((p) => p.metafields.subtitle !== "null")
    .map((p) => p);
  console.log("subtitle", subtitle);
  const ingrediensHTML = data
    .filter((p) => p.metafields.custom.ingrediens_test !== "null")
    .map((p) => p);
  console.log("ingrediensHTML", ingrediensHTML);
  const energy_kj_100g = data
    .filter((p) => p.metafields.custom.energy_kj_100g !== "null")
    .map((p) => p);
  console.log("energy_kj_100g", energy_kj_100g);
  const salt_g_100g = data
    .filter((p) => p.metafields.custom.salt_g_100g !== "null")
    .map((p) => p);
  console.log("salt_g_100g", salt_g_100g);
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

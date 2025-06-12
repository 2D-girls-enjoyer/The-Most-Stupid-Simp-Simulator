async function getCharaNameList() {
  return window.app.getCharaNames();
}

async function getCharaAuthor(charName: string) {
  return window.app.getCharAuthor(charName);
}

export default {
  getCharaNameList,
  getCharaAuthor
}
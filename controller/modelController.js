const {artworkMap} = require("../model/Artwork")
/**
 * populates the artwork map when artwork page
 * is shown, runs asynchronously as to not slow
 * down connection
 * @param data - array of artwork objects
 * @returns - null
 */
const populateArtworkMap = async (data) => {
    artworkMap.clear();
    data.forEach((art) => {artworkMap.set(art.id, art)})
    let mod = data.length % 3;
    let diff = 3 - mod;
    if (mod !== 0) {
        for (let i = 0; i < diff; i++) {
            data.push({});
        }
    }
    // console.log(artworkMap)
}

module.exports = {
    populateArtworkMap
}

function parseIPS(file){
  const ips = fs.readFileSync(`./${file}`);
  const patchdata = [];
  // Ignore first 5 bytes (offsets 0-4)
  for (let i=5; i < ips.length; i++){
    const patch = {}
    /* 
      i and i+1 = offset
      i+2 and i+3 = patch length in bytes OR 0000 = RLE record 
      i+4 through i + (3 + length) = data to patch
    */
    const offset = ips.readUInt16(i)
    patch[offset] = []; 
    i = i+2;
    let length = ips.readUInt16(i);
    i+2;
    if (length > 0) {
      for (let x=0; x < length; x++){
        patch[offset].push(ips.readUInt8(i))
        i++;
      }
    } else {
      // if length is 0, then RLE record. the next two bytes is number of times to repeat the next byte;
      length = ips.readUInt16(i);
      i++;
      const byte = ips.readUInt8(i);
      i++
      for (let x=0; x < length; x++){
        patch[offset] = byte;
      }
    }
    patchdata.push(patch);
  }
}
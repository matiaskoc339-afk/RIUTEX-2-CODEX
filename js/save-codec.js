// LZW síncrono sobre UTF-8, con diccionario limitado y códigos UTF-16 sin sustitutos.
// Reduce la cuota de localStorage y permite escribir al salir, sin esperar tareas asíncronas.
const SaveCodec={
  prefix:'R2LZ1:',limit:32767,maxBytes:5000000,
  encode(value){
    const text=JSON.stringify(value);if(text.length<2000)return text;
    const bytes=new TextEncoder().encode(text),codes=[];
    const fresh=()=>new Map(Array.from({length:256},(_,i)=>[String.fromCharCode(i),i]));
    let dict=fresh(),next=257,word='';
    for(const byte of bytes){const ch=String.fromCharCode(byte),joined=word+ch;
      if(dict.has(joined)){word=joined;continue;}
      codes.push(dict.get(word));
      if(next<=this.limit)dict.set(joined,next++);else{codes.push(256);dict=fresh();next=257;}
      word=ch;
    }
    if(word)codes.push(dict.get(word));
    const chunks=[];for(let i=0;i<codes.length;i+=4096)chunks.push(String.fromCharCode(...codes.slice(i,i+4096)));
    const packed=this.prefix+chunks.join('');return packed.length<text.length?packed:text;
  },
  decode(text){
    if(typeof text!=='string'||text.length>this.maxBytes)return null;
    if(text.startsWith(this.prefix)){
      const fresh=()=>Array.from({length:256},(_,i)=>String.fromCharCode(i));
      let dict=fresh(),next=257,previous='',size=0;const words=[];
      for(let i=this.prefix.length;i<text.length;i++){
        const code=text.charCodeAt(i);if(code===256){dict=fresh();next=257;previous='';continue;}
        const word=dict[code]??(code===next&&previous?previous+previous[0]:null);
        if(word===null||word===undefined)throw new Error('Invalid save data');
        size+=word.length;if(size>this.maxBytes)throw new Error('Save too large');words.push(word);
        if(previous&&next<=this.limit)dict[next++]=previous+word[0];previous=word;
      }
      const binary=words.join(''),bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    }
    return JSON.parse(text,(key,value)=>['__proto__','prototype','constructor'].includes(key)?undefined:value);
  }
};

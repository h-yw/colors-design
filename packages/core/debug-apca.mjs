
import { calcAPCA as libAPCA } from 'apca-w3';

console.log('Testing apca-w3 variations:');
try {
    // Variation 1: Hex Strings (if supported)
    // console.log('Hex:', libAPCA('#ffffff', '#000000')); 

    // Variation 2: Integer Arrays (already failed)
    
    // Variation 3: Simple Numbers (if encoded?)
    
    // Variation 4: Parameters?
    // Looking at source code (if I could):
    // usually it accepts (text, bg)
    
    console.log('Type of import:', typeof libAPCA);

    // Maybe input needs to be Color?
    // Let's print what we got.
    
    // Trying Ints again:
    console.log('Ints [255,255,255], [0,0,0]:', libAPCA([255,255,255, 1], [0,0,0, 1]));

} catch (e) {
    console.error('Error:', e);
}

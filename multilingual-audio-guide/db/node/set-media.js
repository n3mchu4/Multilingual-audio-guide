// CLI maintenance tool. Use either a storage key OR a full http(s) URL.
import { pool, query } from './database.js';
import { mediaUrl } from './storage.js';
try {
  const [id,kind,input] = process.argv.slice(2);
  const columns = { 'audio-vi':'audio_vi_url','audio-en':'audio_en_url','background':'background_image_url' };
  if (!id || !input || (!columns[kind] && kind !== 'gallery')) {
    throw new Error('Usage: npm --prefix db run set:media -- ID audio-vi|audio-en|background|gallery KEY_OR_URL');
  }
  const url = /^https?:\/\//.test(input) ? new URL(input).href : await mediaUrl(input);
  if (kind === 'gallery') {
    await query(`INSERT INTO public.landmark_images(landmark_id,image_url,sort_order)
      VALUES ($1,$2,0) ON CONFLICT (landmark_id,image_url) DO NOTHING`, [id,url]);
  } else {
    const result = await query(`UPDATE public.landmarks SET ${columns[kind]}=$1 WHERE landmark_id=$2`, [url,id]);
    if (!result.rowCount) throw new Error('Landmark ID not found');
  }
  console.log(`Saved ${kind} reference for ${id}`);
} catch (error) { console.error('Media update failed:', error.code ?? error.message); process.exitCode=1; }
finally { await pool.end(); }

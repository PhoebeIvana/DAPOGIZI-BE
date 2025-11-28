const { supabase } = require("../services/supabase");
const axios = require("axios");

async function uploadToSupabase(fileBuffer, folder, filename) {
  const bucketName = "dapogizi-images";
  const randomStr = Math.random().toString(36).substring(2, 7); 
  const ext = filename.split(".").pop().toLowerCase();
  const uniqueFilename = `${randomStr}.${ext}`;
  const filePath = `${folder}/${uniqueFilename}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: `image/${ext}`,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

async function downloadFromSupabase(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

module.exports = {
  uploadToSupabase,
  downloadFromSupabase,
};
